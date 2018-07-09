import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';

export class LineOpen extends GitHistoryMsg {

  public static is(msg: any): Match<LineOpen> {
    if (msg instanceof LineOpen) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<LineOpen>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }
}
