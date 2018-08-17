import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';

export class ConfigStreamOutputMsg extends GitHistoryMsg {

  public readonly sout: NodeJS.WritableStream;
  public readonly serr: NodeJS.WritableStream;

  public static is(msg: any): Match<ConfigStreamOutputMsg> {
    if (msg instanceof ConfigStreamOutputMsg) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<ConfigStreamOutputMsg>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, sout: NodeJS.WritableStream, serr: NodeJS.WritableStream) {
    super(tid);
    this.sout = sout;
    this.serr = serr;
  }

}
