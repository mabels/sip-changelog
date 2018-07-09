
import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';
import { Readable } from 'stream';

export class StreamOpen extends GitHistoryMsg {

  public readonly inStream: Readable;

  public static is(msg: any): Match<StreamOpen> {
    if (msg instanceof StreamOpen) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<StreamOpen>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, inStream: Readable) {
    super(tid);
    this.inStream = inStream;
  }
}
