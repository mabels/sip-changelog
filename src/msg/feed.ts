import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';

export class Feed extends GitHistoryMsg {
  public readonly data: string;

  public static is(msg: any): Match<Feed> {
    if (msg instanceof Feed) {
      return Match.create<Feed>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, data: string) {
    super(tid);
    this.data = data;
  }
}
