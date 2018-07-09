
import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';

export class StreamDone extends GitHistoryMsg {

  public static is(msg: any): Match<StreamDone> {
    if (msg instanceof StreamDone) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<StreamDone>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }
}
