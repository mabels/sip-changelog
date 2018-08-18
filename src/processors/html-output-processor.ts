import { MsgBus } from '../msg-bus';
import { GroupMsgDone } from '../msg/group-msg-done';
import * as Rx from 'rxjs';

import { Stopable } from './output-processor';
import { ConfigStreamOutputMsg } from '../msg/config-stream-output-msg';
import { ChangeLogDone } from '../msg/change-log-done';
import { ConfigStreamOutputDone } from '../msg/config-stream-output-done';
import { NameEmailDate } from '../header-lines/name-email-date';
import { tabIndent } from './text-output-processor';
import { Commit } from '../header-lines/commit';
import { Tag, TagFlag } from '../header-lines/tag';

interface ToHtmlOptions {
  out: NodeJS.WritableStream;
  prefix: string;
  indent: number;
}

function nameEmailDateToHtml(ned: NameEmailDate, opt: ToHtmlOptions): void {
  const iStr = tabIndent(opt.indent);
  opt.out.write(`${iStr}<dt class="${opt.prefix}.name">${ned.name}</dt>\n`);
  opt.out.write(`${iStr}<dt class="${opt.prefix}.email">${ned.email}</dt>\n`);
  opt.out.write(`${iStr}<dt class="${opt.prefix}.date">${ned.date.toISOString()}</dt>\n`);
}

function commitToHtml(commit: Commit, opt: ToHtmlOptions): void {
  const iStr = tabIndent(opt.indent);
  opt.out.write(`${iStr}<dt class="${opt.prefix}.sha">${commit.sha}</dt>\n`);
  opt.out.write(`${iStr}<dl class="${opt.prefix}.tags">\n`);
  const tStr = tabIndent(opt.indent + 1);
  commit.tags(TagFlag.ALL).forEach(tag => {
    opt.out.write(`${tStr}<dt class="${opt.prefix}.tags.tagFlag">${tag.flag}</dt>\n`);
    opt.out.write(`${tStr}<dt class="${opt.prefix}.tags.branch">${tag.branch}</dt>\n`);
  });
  opt.out.write(`${iStr}</dl>\n`);
}

export class HtmlOutputProcessor implements Stopable {

  public readonly subcription: Rx.Subscription;

  public static create(msgBus: MsgBus, csom: ConfigStreamOutputMsg): HtmlOutputProcessor {
    return new HtmlOutputProcessor(msgBus, csom);
  }

  private constructor(msgBus: MsgBus, csom: ConfigStreamOutputMsg) {
    csom.sout.write('<dl class="sip-changelog">\n');
    this.subcription = msgBus.subscribe(msg => {
      ChangeLogDone.is(msg).match(_ => {
        csom.sout.write('</dl>\n');
        msgBus.next(new ConfigStreamOutputDone(csom.tid, csom));
      });
      GroupMsgDone.is(msg).match(({ groupMsg }) => {
        csom.sout.write('\t<dl class="groupMsg">\n');
        csom.sout.write('\t\t<dl class="names">');
        groupMsg.names.forEach(name => {
          csom.sout.write(`\t\t\t<dt class="name">${name}</dt>`);
        });
        csom.sout.write('\t\t</dl>\n');
        csom.sout.write('\t\t<dl class="stories">');
        Array.from(groupMsg.stories.stories.entries()).forEach(([story, gcs]) => {
          csom.sout.write('\t\t<dl class="story">');
          csom.sout.write(`\t\t\t<dt class="name">${story}</dt>\n`);
          csom.sout.write('\t\t\t\t<dl class="commits">');
          gcs.gitCommits.forEach(gc => {
            csom.sout.write('\t\t\t\t<dl class="commit">\n');
            if (gc.commit) {
              commitToHtml(gc.commit, { out: csom.sout, indent: 5, prefix: 'commit' });
            }
            if (gc.committer) {
              nameEmailDateToHtml(gc.committer, { out: csom.sout, indent: 5, prefix: 'committer' });
            }
            if (gc.author) {
              nameEmailDateToHtml(gc.author, { out: csom.sout, indent: 5, prefix: 'author' });
            }
            if (gc.parent) {
              commitToHtml(gc.parent, { out: csom.sout, indent: 5, prefix: 'parent' });
            }
            if (gc.tree) {
              commitToHtml(gc.tree, { out: csom.sout, indent: 5, prefix: 'tree' });
            }
            if (gc.gpgsig) {
              csom.sout.write(`\t\t\t\t\t<dd class="gpgsid"><pre>${gc.gpgsig.signatur()}</pre></dd>\n`);
            }
            csom.sout.write(`\t\t\t\t\t<dd class="message"><pre>${gc.message.text()}</pre></dd>\n`);
            csom.sout.write('\t\t\t\t</dl>\n');
          });
          csom.sout.write('\t\t\t\t</dl>\n');
          csom.sout.write('\t\t\t</dl>');
        });
        csom.sout.write('\t\t</dl>');
        csom.sout.write('\t</dl>');
      });
    });
  }

  public stop(): void {
    this.subcription.unsubscribe();
  }

}
