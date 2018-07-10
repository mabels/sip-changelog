import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';

export class ChangeLog extends GitHistoryMsg {

  public static is(msg: any): Match<ChangeLog> {
    if (msg instanceof ChangeLog) {
      return Match.create<ChangeLog>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }

}
