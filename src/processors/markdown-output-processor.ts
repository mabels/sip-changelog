import { MsgBus } from '../msg-bus';
import { GroupMsgDone } from '../msg/group-msg-done';
import * as Rx from 'rxjs';

import { Stopable } from './output-processor';
import { ConfigStreamOutputMsg } from '../msg/config-stream-output-msg';
import { ChangeLogDone } from '../msg/change-log-done';
import { ConfigStreamOutputDone } from '../msg/config-stream-output-done';
import { tabIndent } from './text-output-processor';

export class MarkdownOutputProcessor implements Stopable {

  public readonly subcription: Rx.Subscription;

  public static create(msgBus: MsgBus, csom: ConfigStreamOutputMsg): MarkdownOutputProcessor {
    return new MarkdownOutputProcessor(msgBus, csom);
  }

  // | Group | Story | Message |
  // | ----- | ----- | ------- |
  // | group | story | message |
  // * Group
  //     * Story
  //         * Meno</br>logo
  private constructor(msgBus: MsgBus, csom: ConfigStreamOutputMsg) {
    // csom.sout.write('| Group | Story | Message |\n');
    // csom.sout.write('| ----- | ----- | ------- |\n');
    this.subcription = msgBus.subscribe(msg => {
      ChangeLogDone.is(msg).match(_ => {
        msgBus.next(new ConfigStreamOutputDone(csom.tid, csom));
      });
      GroupMsgDone.is(msg).match(({ groupMsg }) => {
        csom.sout.write(`${tabIndent(0)}* ${groupMsg.names.join('</br>')}\n`);
        Array.from(groupMsg.stories.stories.entries()).forEach(([story, gcs]) => {
            csom.sout.write(`${tabIndent(1)}* ${story}\n`);
            gcs.gitCommits.forEach(gc => {
              csom.sout.write(`${tabIndent(2)}* <code>${gc.message.textLines().join('</br>')}</code>\n`);
            });
          });
      });
    });
  }

  public stop(): void {
    this.subcription.unsubscribe();
  }

}
