import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';

export class FeedLine extends GitHistoryMsg {
  public readonly line: string;

  public static is(msg: any): Match<FeedLine> {
    if (msg instanceof FeedLine) {
      return Match.create<FeedLine>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, line: string) {
    super(tid);
    this.line = line;
  }
}
