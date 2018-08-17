import { MsgBus } from '../msg-bus';
import { GroupMsgDone } from '../msg/group-msg-done';
import * as Rx from 'rxjs';

import { Stopable } from './output-processor';

function indent(i: number): string {
  return (new Array(i)).fill('\t').join('');
}

export class TextOutputProcessor implements Stopable {

  public readonly subcription: Rx.Subscription;

  public static create(msgBus: MsgBus): TextOutputProcessor {
    return new TextOutputProcessor(msgBus);
  }

  private constructor(msgBus: MsgBus) {
    this.subcription = msgBus.subscribe(msg => {
      // console.log(msg);
      GroupMsgDone.is(msg).match(({ groupMsg }) => {
        const names = groupMsg.names.join(',');
        if (names !== '') {
          process.stdout.write(`${indent(0)}${names}\n`);
        }
        Array.from(groupMsg.stories.stories.entries())
          .forEach(([story, gcs]) => {
            if (story !== '') {
              process.stdout.write(`${indent(1)}${story}\n`);
            }
            gcs.gitCommits.forEach(gc => {
              process.stdout.write(`${indent(2)}${gc.message.excerpt()}\n`);
            });
          });
      });
    });
  }

  public stop(): void {
    this.subcription.unsubscribe();
  }

}
