import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';

export class GitHistoryStart extends GitHistoryMsg {

  public static is(msg: any): Match<GitHistoryStart> {
    if (msg instanceof GitHistoryStart) {
      return Match.create<GitHistoryStart>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }
}
