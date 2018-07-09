import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';
import { SipChangeLog } from '../sip-change-log';
import { ReFlagMatch } from '../cli/re-flag-match';
import { SipConfigInit } from './sip-config';
import { ReFlag } from '../cli/re-flags';

export class CliConfig extends GitHistoryMsg {
  public readonly storyMatches: ReFlag[];
  public readonly groupByTags: ReFlag[];
  public readonly start: RegExp;
  public readonly config: SipConfigInit;

  public static is(msg: any): Match<CliConfig> {
    if (msg instanceof CliConfig) {
      return Match.create<CliConfig>(msg);
    }
    return Match.nothing();
  }

  constructor(tid: string, config: SipConfigInit) {
    super(tid);
    this.config = config;
    this.storyMatches = ReFlag.create(config.storyMatches, config.storyMatchRegexFlags);
    this.groupByTags = ReFlag.create(config.groupByTags, config.groupByTagRegexFlags);
    this.start = new RegExp(config.start || 'will@never@ever@matched');
  }
}
