import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';

export class LineDone extends GitHistoryMsg {

  public static is(msg: any): Match<LineDone> {
    if (msg instanceof LineDone) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<LineDone>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }
}
