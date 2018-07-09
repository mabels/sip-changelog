
import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';

export class StreamData extends GitHistoryMsg {

  public readonly data: string;

  public static is(msg: any): Match<StreamData> {
    if (msg instanceof StreamData) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<StreamData>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, data: string) {
    super(tid);
    this.data = data;
  }
}
