import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';
import { SipChangeLog } from '../sip-change-log';

export class CliConfig extends GitHistoryMsg {

  public readonly config: SipChangeLog;

  public static is(msg: any): Match<CliConfig> {
    if (msg instanceof CliConfig) {
      return Match.create<CliConfig>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, config: SipChangeLog) {
    super(tid);
    this.config = config;
  }

}
