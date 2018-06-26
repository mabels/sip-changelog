import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';

export class GitHistoryStart extends GitHistoryMsg {

  public readonly argv: string[];

  public static is(msg: any): Match<GitHistoryStart> {
    if (msg instanceof GitHistoryStart) {
      return Match.create<GitHistoryStart>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, argv: string[]) {
    super(tid);
    this.argv = argv;
  }
}
