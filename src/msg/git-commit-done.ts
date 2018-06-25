import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';

export class GitCommitDone extends GitHistoryMsg {

  public static is(msg: any): Match<GitCommitDone> {
    if (msg instanceof GitCommitDone) {
      return Match.create<GitCommitDone>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }

}
