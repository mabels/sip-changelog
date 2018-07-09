import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';

export class LineLine extends GitHistoryMsg {
  public readonly line: string;

  public static is(msg: any): Match<LineLine> {
    if (msg instanceof LineLine) {
      return Match.create<LineLine>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, line: string) {
    super(tid);
    this.line = line;
  }
}
