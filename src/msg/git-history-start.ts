import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';
// import { GitHistory } from '../git-history';

export class GitHistoryStart extends GitHistoryMsg {
  // public readonly gitHistory: GitHistory;

  public static is(msg: any): Match<GitHistoryStart> {
    if (msg instanceof GitHistoryStart) {
      return Match.create<GitHistoryStart>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string/* , gitHistory: GitHistory */) {
    super(tid);
    // this.gitHistory = gitHistory;
  }

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    sout.write(`GitHistoryStart:output\n`);
  }

}
