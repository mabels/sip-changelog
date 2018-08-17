import { MsgBus } from '../msg-bus';
import { GroupMsgDone } from '../msg/group-msg-done';
import * as Rx from 'rxjs';

import { Stopable } from './output-processor';
import { ChangeLogOpen } from '../msg/change-log-open';
import { GroupMsg } from '../msg/group-msg';
import { ChangeLogDone } from '../msg/change-log-done';

export class JsonOutputProcessor implements Stopable {

  public readonly groupMsgs: GroupMsg[] = [];
  public readonly subcription: Rx.Subscription;

  public static create(msgBus: MsgBus): JsonOutputProcessor {
    return new JsonOutputProcessor(msgBus);
  }

  private constructor(msgBus: MsgBus) {
    this.subcription = msgBus.subscribe(msg => {
      ChangeLogDone.is(msg).match(_ => {
        process.stdout.write(
          JSON.stringify(this.groupMsgs.map(i => i.toJson()), null, 2)
        );
        process.stdout.write('\n');
      });
      GroupMsgDone.is(msg).match(({ groupMsg }) => {
        this.groupMsgs.push(groupMsg);
      });
    });
  }

  public stop(): void {
    this.subcription.unsubscribe();
  }

}
