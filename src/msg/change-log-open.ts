import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';

export class ChangeLogOpen extends GitHistoryMsg {

  public static is(msg: any): Match<ChangeLogOpen> {
    if (msg instanceof ChangeLogOpen) {
      return Match.create<ChangeLogOpen>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }

}
