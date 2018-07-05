import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';

export class FeedChunkDone extends GitHistoryMsg {

  public static is(msg: any): Match<FeedChunkDone> {
    if (msg instanceof FeedChunkDone) {
      return Match.create<FeedChunkDone>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }
}
