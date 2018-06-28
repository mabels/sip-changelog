import * as fs from 'fs';
import { Readable } from 'stream';
import * as execa from 'execa';

import { GitHistory } from '../git-history';
import { GitHistoryError } from '../msg/git-history-error';
import { Feed } from '../msg/feed';
import { FeedDone } from '../msg/feed-done';
import { GitHistoryStart } from '../msg/git-history-start';
import { GitCommit } from '../msg/git-commit';
import { GitCommitDone } from '../msg/git-commit-done';
import { ChangeLog } from './change-log';
import { Command, flags } from '@oclif/command';
import { SipConfigInit } from '../msg/sip-config';
const OclifErrorHandler = require('@oclif/errors/handle');

function feedGitHistory(gh: GitHistory, streamGitHistory: Readable): void {
  streamGitHistory.on('data', (chunk: Buffer) => {
    // console.error('data', action.fname);
    gh.next(new Feed(gh.tid, chunk.toString()));
  }).on('end', () => {
    // console.error('end', action.fname);
    gh.next(new FeedDone(gh.tid));
  }).on('error', (err: Error) => {
    gh.next(new GitHistoryError(gh.tid, err));
  });
}

function defaultBoolean(v: any, d = true): boolean {
  if (typeof (v) == 'boolean') {
    return v;
  }
  return d;
}

export class SipChangeLog extends Command {
  // tslint:disable-next-line:typedef
  public static description = 'sip-changelog generator';
  // tslint:disable-next-line:typedef
  public static args = [
    { name: 'firstArg' },
    { name: 'secondArg' }
  ];

  // tslint:disable-next-line:typedef
  public static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    'story-match': flags.string({
      multiple: true,
      description: 'only take commits which are include story-match regex'
    }),
    'story-match-regex-flag': flags.string({
      multiple: true,
      description: 'pass flag to story match regex',
    }),
    'story-sort-numeric': flags.boolean({
      allowNo: true,
      description: 'do not sort stories by numeric identifier',
    }),
    'commit-excerpt': flags.boolean({
      allowNo: true,
      description: 'switch of the commit excerpts in the commits',
    }),
    'group-by-tag': flags.string({
      multiple: true,
      description: 'group tags by group-by-tag regex'
    }),
    'group-by-tag-regex-flag': flags.string({
      multiple: true,
      description: 'pass flag to group by tag regex',
    }),
    'start': flags.string({
      description: 'define start tag',
    }),
    'git-cmd': flags.string({
      description: 'path to git executeable',
      default: 'git'
    }),
    'git-options': flags.string({
      description: 'git options',
      default: 'log --format=raw --decorate=full'
    }),
    'file': flags.string({
      description: 'instead of execute git read from file'
    })
  };

  public async run(): Promise<SipConfigInit> {
    // can get args as an object
    const cfg = this.parse(SipChangeLog);
    return {
      storyMatches: cfg.flags['story-match'] || [''],
      storyMatchRegexFlags: cfg.flags['story-match-regex-flag'] || [],
      groupByTags: cfg.flags['group-by-tag'] || [''],
      groupByTagRegexFlags: cfg.flags['group-by-tag-regex-flag'] || [],

      storySortNumeric: defaultBoolean(cfg.flags['story-sort-numeric']),
      commitExcerpt: defaultBoolean(cfg.flags['commit-excerpt']),

      start: cfg.flags['start'],
      file: cfg.flags['file'],
      gitCmd: cfg.flags['git-cmd'],
      gitOptions: cfg.flags['git-options'],
    };
  }
}

export namespace Cli {
  export async function factory(args: string[]): Promise<GitHistory> {
    const gh = new GitHistory();
    try {
      const config = await SipChangeLog.run(args);
      if (config.help) {
        gh.subscribe(msg => {
          GitHistoryStart.is(msg).hasTid(gh.tid).match(_ => {
            gh.next(config);
          });
        });
        return gh;
      }
      // console.log(args, config);
      const changeLog = new ChangeLog(gh.tid, config);
      gh.subscribe(msg => {
        // console.log(msg);
        GitCommit.is(msg).hasTid(gh.tid).match(gc => {
          changeLog.add(gh.tid, gc);
        });
        GitCommitDone.is(msg).hasTid(gh.tid).match(_ => {
          // console.log(`GitCommitDone:recv:i`);
          changeLog.forEach(gm => gh.next(gm));
          gh.next(gh.groupMsgDone());
          // console.log(`GitCommitDone:recv:o`);
        });
        GitHistoryStart.is(msg).hasTid(gh.tid).match(_ => {
          if (!config.file) {
            const child = execa.shell(`${JSON.stringify(config.gitCmd)} ${config.gitOptions}`);
            child.catch((err) => {
              if (err) {
                console.log(`exec error`, err);
                gh.next(gh.errorMsg(err));
                gh.next(gh.gitHistoryDoneMsg());
              }
            });
            child.stderr.pipe(process.stderr);
            feedGitHistory(gh, child.stdout);
          } else {
            feedGitHistory(gh, fs.createReadStream(config.file));
          }
        });
      });
    } catch (e) {
      OclifErrorHandler(e);
    }
    return gh;
  }
}
