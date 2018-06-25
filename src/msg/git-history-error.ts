import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';

export class GitHistoryError extends GitHistoryMsg {
  public readonly error: Error;

  public static is(msg: any): Match<GitHistoryError> {
    if (msg instanceof GitHistoryError) {
      return Match.create<GitHistoryError>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, error: Error) {
    super(tid);
    this.error = error;
  }
}
