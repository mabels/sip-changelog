import { MsgBus } from '../msg-bus';
import { GroupMsgDone } from '../msg/group-msg-done';
import * as Rx from 'rxjs';

import { Stopable } from './output-processor';
import { ConfigStreamOutputMsg } from '../msg/config-stream-output-msg';
import { ChangeLogDone } from '../msg/change-log-done';
import { ConfigStreamOutputDone } from '../msg/config-stream-output-done';

export function tabIndent(i: number): string {
  return (new Array(i)).fill('\t').join('');
}

export class TextOutputProcessor implements Stopable {

  public readonly subcription: Rx.Subscription;

  public static create(msgBus: MsgBus, csom: ConfigStreamOutputMsg): TextOutputProcessor {
    return new TextOutputProcessor(msgBus, csom);
  }

  private constructor(msgBus: MsgBus, csom: ConfigStreamOutputMsg) {
    this.subcription = msgBus.subscribe(msg => {
      ChangeLogDone.is(msg).match(_ => {
        msgBus.next(new ConfigStreamOutputDone(csom.tid, csom));
      });
      GroupMsgDone.is(msg).match(({ groupMsg }) => {
        const names = groupMsg.names.join(',');
        if (names !== '') {
          // console.log(`${indent(0)}${names}\n`);
          csom.sout.write(`${tabIndent(0)}${names}\n`);
        }
        Array.from(groupMsg.stories.stories.entries())
          .forEach(([story, gcs]) => {
            if (story !== '') {
              // console.log(`${indent(1)}${story}\n`);
              csom.sout.write(`${tabIndent(1)}${story}\n`);
            }
            gcs.gitCommits.forEach(gc => {
              // console.log(`${indent(2)}${gc.message.excerpt()}\n`);
              csom.sout.write(`${tabIndent(2)}${gc.message.excerpt()}\n`);
            });
          });
      });
    });
  }

  public stop(): void {
    this.subcription.unsubscribe();
  }

}
