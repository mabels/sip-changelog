import { MsgBus } from '../msg-bus';
import { GroupMsgDone } from '../msg/group-msg-done';
import * as Rx from 'rxjs';

import { Stopable } from './output-processor';
import { ChangeLogOpen } from '../msg/change-log-open';
import { GroupMsg } from '../msg/group-msg';
import { ChangeLogDone } from '../msg/change-log-done';
import { ConfigStreamOutputMsg } from '../msg/config-stream-output-msg';
import { ConfigStreamOutputDone } from '../msg/config-stream-output-done';

export class JsonOutputProcessor implements Stopable {

  public readonly groupMsgs: GroupMsg[] = [];
  public readonly subcription: Rx.Subscription;

  public static create(msgBus: MsgBus, csom: ConfigStreamOutputMsg): JsonOutputProcessor {
    return new JsonOutputProcessor(msgBus, csom);
  }

  private constructor(msgBus: MsgBus, csom: ConfigStreamOutputMsg) {
    this.subcription = msgBus.subscribe(msg => {
      ChangeLogDone.is(msg).match(_ => {
        csom.sout.write(JSON.stringify(this.groupMsgs.map(i => i.toJson()), null, 2));
        csom.sout.write('\n');
        msgBus.next(new ConfigStreamOutputDone(csom.tid, csom));
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
