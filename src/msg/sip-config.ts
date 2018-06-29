import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';

export interface SipConfigInit {
  readonly storyMatches: string[];
  readonly storyMatchRegexFlags: string[];
  readonly groupByTags: string[];
  readonly groupByTagRegexFlags: string[];
  readonly storySortNumeric: boolean;
  readonly omitExcerpt: boolean;

  readonly start: string;
  readonly gitCmd: string;
  readonly gitOptions: string;
  readonly file: string;
}

export class SipConfig extends GitHistoryMsg implements SipConfigInit {

  public readonly storyMatches: string[];
  public readonly storyMatchRegexFlags: string[];
  public readonly groupByTags: string[];
  public readonly groupByTagRegexFlags: string[];
  public readonly storySortNumeric: boolean;
  public readonly omitExcerpt: boolean;

  public readonly start: string;
  public readonly gitCmd: string;
  public readonly gitOptions: string;
  public readonly file: string;

  public static is(msg: any): Match<SipConfig> {
    if (msg instanceof SipConfig) {
      return Match.create<SipConfig>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, sci: SipConfigInit) {
    super(tid);
    this.storyMatches = sci.storyMatches;
    this.storyMatchRegexFlags = sci.storyMatchRegexFlags;
    this.groupByTags = sci.groupByTags;
    this.groupByTagRegexFlags = sci.groupByTagRegexFlags;
    this.storySortNumeric = sci.storySortNumeric;
    this.omitExcerpt = sci.omitExcerpt;
    this.start = sci.start;
    this.gitCmd = sci.gitCmd;
    this.gitOptions = sci.gitOptions;
    this.file = sci.file;
  }
}
