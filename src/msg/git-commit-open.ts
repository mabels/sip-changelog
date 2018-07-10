import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';
import { GitCommit } from './git-commit';

export class GitCommitOpen extends GitHistoryMsg {

  public static is(msg: any): Match<GitCommitOpen> {
    if (msg instanceof GitCommitOpen) {
      return Match.create<GitCommitOpen>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }

}
