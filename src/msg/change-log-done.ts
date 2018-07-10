import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';

export class ChangeLogDone extends GitHistoryMsg {

  public static is(msg: any): Match<ChangeLogDone> {
    if (msg instanceof ChangeLogDone) {
      return Match.create<ChangeLogDone>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }

}
