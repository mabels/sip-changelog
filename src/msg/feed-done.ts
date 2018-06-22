import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';

export class FeedDone extends GitHistoryMsg {

  public static is(msg: any): Match<FeedDone> {
    if (msg instanceof FeedDone) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<FeedDone>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }
}
