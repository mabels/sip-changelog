import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';

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

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    // console.error('console.error:');
    serr.write(this.error.message + '\n');
    serr.write(this.error.stack + '\n');
  }
}
