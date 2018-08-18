import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';
import { ConfigStreamOutputMsg } from './config-stream-output-msg';

export class ConfigStreamOutputDone extends GitHistoryMsg {

  public readonly configStreamOutputMsg: ConfigStreamOutputMsg;

  public static is(msg: any): Match<ConfigStreamOutputDone> {
    if (msg instanceof ConfigStreamOutputDone) {
      // console.log(`Match:FeedDone`, msg);
      return Match.create<ConfigStreamOutputDone>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, csom: ConfigStreamOutputMsg) {
    super(tid);
    this.configStreamOutputMsg = csom;
  }

}
