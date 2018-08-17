import { MsgBus } from '../msg-bus';
import { GroupMsgDone } from '../msg/group-msg-done';
import * as Rx from 'rxjs';

import { Stopable } from './output-processor';

export class HtmlOutputProcessor implements Stopable {

  public readonly subcription: Rx.Subscription;

  public static create(msgBus: MsgBus): HtmlOutputProcessor {
    return new HtmlOutputProcessor(msgBus);
  }

  private constructor(msgBus: MsgBus) {
    this.subcription = msgBus.subscribe(msg => {
      GroupMsgDone.is(msg).match(({ groupMsg }) => {
        process.stdout.write(groupMsg.names.join(',') + '\n');
        Array.from(groupMsg.stories.stories.entries())
          .forEach(([story, gcs]) => {
            process.stdout.write(story + '\n');
            gcs.gitCommits.forEach(gc => {
              process.stdout.write(gc.message.excerpt() + '\n');
            });
          });
      });
    });
  }

  public stop(): void {
    this.subcription.unsubscribe();
  }

}
