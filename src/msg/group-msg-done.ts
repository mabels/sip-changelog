import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';

export class GroupMsgDone extends GitHistoryMsg {

  public readonly lines: string[];

  public static is(msg: any): Match<GroupMsgDone> {
    if (msg instanceof GroupMsgDone) {
      return Match.create<GroupMsgDone>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }

}
