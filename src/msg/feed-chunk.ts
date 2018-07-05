import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';

export class FeedChunk extends GitHistoryMsg {
  public readonly data: string;

  public static is(msg: any): Match<FeedChunk> {
    if (msg instanceof FeedChunk) {
      return Match.create<FeedChunk>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, data: string) {
    super(tid);
    this.data = data;
  }
}
