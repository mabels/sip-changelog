import { Command, flags } from '@oclif/command';
import { SipConfigInit } from './msg/sip-config';

function defaultBoolean(v: any, d = true): boolean {
  if (typeof (v) == 'boolean') {
    return v;
  }
  return d;
}

export class SipChangeLog extends Command {
  // tslint:disable-next-line:typedef
  public static description = 'sip-changelog generator';
  // tslint:disable-next-line:typedef
  public static args = [
    { name: 'firstArg' },
    { name: 'secondArg' }
  ];

  // tslint:disable-next-line:typedef
  public static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    'text': flags.string({
      description: 'outputs text'
    }),
    'json': flags.string({
      description: 'outputs json'
    }),
    'markdown': flags.string({
      description: 'outputs markdown'
    }),
    'html': flags.string({
      description: 'outputs html'
    }),
    'story-match': flags.string({
      multiple: true,
      description: 'only take commits which are include story-match regex'
    }),
    'story-match-regex-flag': flags.string({
      multiple: true,
      description: 'pass flag to story match regex',
    }),
    'story-sort-numeric': flags.boolean({
      allowNo: true,
      description: 'do not sort stories by numeric identifier',
    }),
    'omit-excerpt': flags.boolean({
      allowNo: true,
      description: 'switch off the commit excerpts per story',
    }),
    'group-by-tag': flags.string({
      multiple: true,
      description: 'group tags by group-by-tag regex'
    }),
    'group-by-tag-regex-flag': flags.string({
      multiple: true,
      description: 'pass flag to group by tag regex',
    }),
    'start': flags.string({
      description: 'define start tag',
    }),
    'git-cmd': flags.string({
      description: 'path to git executeable',
      default: 'git'
    }),
    'git-options': flags.string({
      description: 'git options',
      default: 'log --format=raw --decorate=full'
    }),
    'file': flags.string({
      description: 'instead of execute git read from file'
    })
  };

  public async run(): Promise<SipConfigInit> {
    // can get args as an object
    const cfg = this.parse(SipChangeLog);
    return {
      storyMatches: cfg.flags['story-match'] || [''],
      storyMatchRegexFlags: cfg.flags['story-match-regex-flag'] || [],
      groupByTags: cfg.flags['group-by-tag'] || [],
      groupByTagRegexFlags: cfg.flags['group-by-tag-regex-flag'] || [],

      storySortNumeric: defaultBoolean(cfg.flags['story-sort-numeric']),
      omitExcerpt: defaultBoolean(cfg.flags['omit-excerpt']),

      start: cfg.flags['start'],
      file: cfg.flags['file'],
      gitCmd: cfg.flags['git-cmd'],
      gitOptions: cfg.flags['git-options'],

      text: !!cfg.flags['text'],
      json: !!cfg.flags['json'],
      html: !!cfg.flags['html'],
      markdown: !!cfg.flags['markdown']

    };
  }
}
