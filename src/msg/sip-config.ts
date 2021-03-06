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
  readonly excludeStart: boolean;
  readonly gitCmd: string;
  readonly gitOptions: string;
  readonly file: string;

  readonly text: boolean;
  readonly html: boolean;
  readonly json: boolean;
  readonly markdown: boolean;
}

export class SipConfig extends GitHistoryMsg implements SipConfigInit {

  public readonly storyMatches: string[];
  public readonly storyMatchRegexFlags: string[];
  public readonly groupByTags: string[];
  public readonly groupByTagRegexFlags: string[];
  public readonly storySortNumeric: boolean;
  public readonly omitExcerpt: boolean;

  public readonly start: string;
  public readonly excludeStart: boolean;
  public readonly gitCmd: string;
  public readonly gitOptions: string;
  public readonly file: string;

  public readonly text: boolean;
  public readonly html: boolean;
  public readonly json: boolean;
  public readonly markdown: boolean;

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
    this.excludeStart = sci.excludeStart;
    this.gitCmd = sci.gitCmd;
    this.gitOptions = sci.gitOptions;
    this.file = sci.file;

    this.text = sci.text;
    this.html = sci.html;
    this.json = sci.json;
    this.markdown = sci.markdown;
  }
}
