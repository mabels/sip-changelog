import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';
// import { SipChangeLog } from '../sip-change-log';
// import { ReFlagMatch } from '../cli/re-flag-match';
// import { CliConfig } from './sip-config';
import { ReFlag } from '../processors/re-flags';
import { SipConfig } from './sip-config';

export enum CliConfigOutputFormat {
  text = 'text',
  html = 'html',
  json = 'json',
  markdown = 'markdown',
}

export class CliConfig extends GitHistoryMsg {
  public readonly storyMatches: ReFlag[];
  public readonly groupByTags: ReFlag[];
  public readonly start: RegExp;
  public readonly excludeStart: boolean;
  public readonly config: SipConfig;
  public readonly outputFormat: CliConfigOutputFormat;

  public static is(msg: any): Match<CliConfig> {
    if (msg instanceof CliConfig) {
      return Match.create<CliConfig>(msg);
    }
    return Match.nothing();
  }

  constructor(tid: string, config: SipConfig) {
    super(tid);
    this.config = config;
    this.storyMatches = ReFlag.create(
      config.storyMatches,
      config.storyMatchRegexFlags
    );
    this.groupByTags = ReFlag.create(
      config.groupByTags,
      config.groupByTagRegexFlags
    );
    this.start = new RegExp(config.start || 'will@never@ever@matched');
    this.excludeStart = config.excludeStart;
    if (config.html) {
      this.outputFormat = CliConfigOutputFormat.html;
    } else if (config.json) {
      this.outputFormat = CliConfigOutputFormat.json;
    } else if (config.markdown) {
      this.outputFormat = CliConfigOutputFormat.markdown;
    } else {
      this.outputFormat = CliConfigOutputFormat.text;
    }
  }
}
