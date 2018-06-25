import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';

export abstract class CliOutputMsg extends GitHistoryMsg {

  public static is(msg: any): Match<CliOutputMsg> {
    if (msg instanceof CliOutputMsg) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<CliOutputMsg>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }

  public abstract output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void;
}
