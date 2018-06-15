import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';

export class GitHistoryWarning extends GitHistoryMsg {
  public readonly data: string;

  public static is(msg: any): Match<GitHistoryWarning> {
    if (msg instanceof GitHistoryWarning) {
      return Match.create<GitHistoryWarning>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, data: string) {
    super(tid);
    this.data = data;
  }
}
