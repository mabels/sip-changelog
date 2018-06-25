import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';
import { CliOutputMsg } from './cli-output-msg';

export class GitHistoryError extends CliOutputMsg {
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
    serr.write(this.error.message + '\n');
    serr.write(this.error.stack + '\n');
  }
}
