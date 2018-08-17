import { MsgBus } from '../msg-bus';
import { CliArgs } from '../msg/cli-args';
import { CliConfig } from '../msg/cli-config';
import { SipConfigInit } from '../msg/sip-config';
import * as Cli from '@oclif/command';

const OclifErrorHandler = require('@oclif/errors/handle');

function defaultBoolean<T>(v: T, d = true): boolean {
  if (typeof(v) == 'boolean') {
    return v;
  }
  return d;
}

export class CliCommand extends Cli.Command {

  // tslint:disable-next-line:typedef
  public static description = 'sip-changelog generator';

  // tslint:disable-next-line:typedef
  public static args = [
    { name: 'firstArg' },
    { name: 'secondArg' }
  ];

  // tslint:disable-next-line:typedef
  public static flags = {
    version: Cli.flags.version({ char: 'v' }),
    help: Cli.flags.help({ char: 'h' }),
    'text': Cli.flags.boolean({
      allowNo: true,
      description: 'outputs text'
    }),
    'json': Cli.flags.boolean({
      allowNo: true,
      description: 'outputs json'
    }),
    'markdown': Cli.flags.boolean({
      allowNo: true,
      description: 'outputs markdown'
    }),
    'html': Cli.flags.boolean({
      allowNo: true,
      description: 'outputs html'
    }),
    'story-match': Cli.flags.string({
      multiple: true,
      description: 'only take commits which are include story-match regex'
    }),
    'story-match-regex-flag': Cli.flags.string({
      multiple: true,
      description: 'pass flag to story match regex',
    }),
    'story-sort-numeric': Cli.flags.boolean({
      allowNo: true,
      description: 'do not sort stories by numeric identifier',
    }),
    'omit-excerpt': Cli.flags.boolean({
      allowNo: true,
      description: 'switch off the commit excerpts per story',
    }),
    'group-by-tag': Cli.flags.string({
      multiple: true,
      description: 'group tags by group-by-tag regex'
    }),
    'group-by-tag-regex-flag': Cli.flags.string({
      multiple: true,
      description: 'pass flag to group by tag regex',
    }),
    'start': Cli.flags.string({
      description: 'define start tag',
    }),
    'git-cmd': Cli.flags.string({
      description: 'path to git executeable',
      default: 'git'
    }),
    'git-options': Cli.flags.string({
      description: 'git options',
      default: 'log --format=raw --decorate=full',
    }),
    'file': Cli.flags.string({
      description: 'instead of execute git read from file'
    })
  };

  public async run(): Promise<SipConfigInit> {
    // can get args as an object
   const _flags = this.parse(CliCommand).flags;
   return {
      storyMatches: _flags['story-match'] || [''],
      storyMatchRegexFlags: _flags['story-match-regex-flag'] || [],
      groupByTags: _flags['group-by-tag'] || [],
      groupByTagRegexFlags: _flags['group-by-tag-regex-flag'] || [],

      storySortNumeric: defaultBoolean(_flags['story-sort-numeric']),
      omitExcerpt: defaultBoolean(_flags['omit-excerpt']),

      start: _flags['start'],
      file: _flags['file'],
      gitCmd: _flags['git-cmd'],
      gitOptions: _flags['git-options'],

      text: !!_flags['text'],
      json: !!_flags['json'],
      html: !!_flags['html'],
      markdown: !!_flags['markdown']
    };
  }

}

export class CliProcessor {

  public static create(msgBus: MsgBus): CliProcessor {
    return new CliProcessor(msgBus);
  }

  private constructor(msgBus: MsgBus) {
    msgBus.subscribe(msg => {
      CliArgs.is(msg).match(cliArgs => {
        CliCommand.run(cliArgs.args).then(config => {
          // console.log('Config:', config);
          if (config.help) {
            return;
          }
          msgBus.next(new CliConfig(msg.tid, config));
        }).catch(e => OclifErrorHandler(e));
      });
    });
  }

}
