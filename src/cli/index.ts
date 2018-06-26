import * as fs from 'fs';
import * as yargs from 'yargs';
import { ArgumentParser } from 'argparse';
import { Readable } from 'stream';
import { exec } from 'child_process';

import { GitHistory } from '../git-history';
import { GitHistoryError } from '../msg/git-history-error';
import { Feed } from '../msg/feed';
import { FeedDone } from '../msg/feed-done';
import { GitHistoryStart } from '../msg/git-history-start';
import { GitCommit } from '../msg/git-commit';
import { GitCommitDone } from '../msg/git-commit-done';
import { ChangeLog } from './change-log';
import { HelpMsg } from '../msg/help-msg';
import { Command, flags } from '@oclif/command';

function feedGitHistory(gh: GitHistory, streamGitHistory: Readable): void {
  streamGitHistory.on('data', (chunk: Buffer) => {
    // console.error('data', action.fname);
    gh.next(new Feed(gh.tid, chunk.toString()));
  }).on('end', () => {
    // console.error('end', action.fname);
    gh.next(new FeedDone(gh.tid));
  }).on('error', (err: Error) => {
    gh.next(new GitHistoryError(gh.tid, err));
  });
}

export class MyCLI extends Command {
  public static description = 'describe the command here';
  public static args = [ {name: 'firstArg'}, {name: 'secondArg'} ];

  public static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  };

  public async run(): Promise<any> {
    // can get args as an object
    const {args} = this.parse(MyCLI);
    console.log(`running my command with args: ${args.firstArg}, ${args.secondArg}`);
    // can also get the args as an array
    const {argv} = this.parse(MyCLI);
    console.log(`running my command with args: ${argv[0]}, ${argv[1]}`);
  }
}

export namespace Cli {
  export function factory(args: string[]): GitHistory {
    const gh = new GitHistory();

    MyCLI.run(process.argv).catch(require('@oclif/errors/handle'));
    return gh;

    let cli = new ArgumentParser({
      version: require('../../../package.json').version,
      addHelp: true,
      description: 'sip-changelog generator'
    });
    cli.addArgument(
      ['--story-match'], {
        action: 'append',
        defaultValue: [''],
        type: () => console.log(arguments),
        required: false,
        help: 'only take commits which are include story-match regex'
      });
    cli.addArgument('--story-match-regex-flag', {
      required: false,
      help: 'pass flag to story match regex',
      defaultValue: []
    });
    cli.addArgument('--story-sort-numeric', {
      required: false,
      nargs: '?',
      help: 'do not sort stories by numeric identifier',
      defaultValue: true
    });
    cli.addArgument('--commit-excerpt', {
      required: false,
      nargs: '?',
      help: 'switch of the commit excerpts in the commits',
      defaultValue: true
    });
    cli.addArgument('--group-by-tag', {
      required: false,
      help: 'group tags by group-by-tag regex',
      defaultValue: ['']
    });
    cli.addArgument('--group-by-tag-regex-flag', {
      required: false,
      help: 'pass flag to group by tag regex',
      defaultValue: []
    });
    cli.addArgument('--start', {
      required: false,
      help: 'define start tag',
    });
    cli.addArgument('--git-cmd', {
      required: false,
      help: 'path to git executeable',
      defaultValue: 'git'
    });
    cli.addArgument('--git-options', {
      required: false,
      help: 'git options',
      defaultValue: 'log --format=raw --decorate=full'
    });
    cli.addArgument('--file', {
      required: false,
      help: 'instead of execute git read from file'
    });
    const cargs = cli.parseArgs(process.argv.slice(2));
    console.log(cargs);
    return;

    const y = yargs.usage('$0 <cmd> [args]')
      .version()
      .option('story-match', {
        describe: 'only take commits which are include story-match regex',
        type: 'array',
        default: ['']
      }).option('story-match-regex-flag', {
        describe: 'pass flag to story match regex',
        default: []
      }).option('story-sort-numeric', {
        describe: 'do not sort stories by numeric identifier',
        default: true
      }).option('commit-excerpt', {
        describe: 'switch of the commit excerpts in the commits',
        default: true
      }).option('group-by-tag', {
        describe: 'group tags by group-by-tag regex',
        type: 'array',
        default: ['']
      }).option('group-by-tag-regex-flag', {
        describe: 'pass flag to group by tag regex',
        default: []
      }).option('start', {
        describe: 'define start tag',
      }).option('git-cmd', {
        describe: 'path to git executeable',
        default: 'git'
      }).option('git-options', {
        describe: 'git options',
        default: 'log --format=raw --decorate=full'
      }).option('file', {
        describe: 'instead of execute git read from file'
      }).option('help', {
        describe: 'print help'
      }).help(false).exitProcess(false);
    const config = y.parse(args);
    if (config.help) {
      gh.subscribe(msg => {
        GitHistoryStart.is(msg).hasTid(gh.tid).match(_ => {
          console.log('-----');
          console.log(`-[${Object.keys(y)}]-`);
          y.help();
          console.log('-----');
          // console.log(`-[${(y as any).getUsageInstance().help() }]-`);
          // gh.next(new HelpMsg(gh.tid));
        });
      });
      return gh;
    }
    // console.log(args, config);
    const changeLog = new ChangeLog(gh.tid, {
      storyMatches: config.storyMatch,
      storyMatchRegexFlags: config.storyMatchRegexFlag,
      groupByTags: config.groupByTag,
      groupByTagRegexFlags: config.groupByTagRegexFlag,
      storySortNumeric: config.storySortNumeric,
      commitExcerpt: config.commitExcerpt
    });
    gh.subscribe(msg => {
      // console.log(msg);
      GitCommit.is(msg).hasTid(gh.tid).match(gc => {
        changeLog.add(gh.tid, gc);
      });
      GitCommitDone.is(msg).hasTid(gh.tid).match(_ => {
        changeLog.forEach(gm => gh.next(gm));
      });
      GitHistoryStart.is(msg).hasTid(gh.tid).match(_ => {
        if (!config.file) {
          const child = exec(`${JSON.stringify(config.gitCmd)} ${config.gitOptions}`, (err) => {
            // console.log(`exec error`, err);
            gh.next(gh.errorMsg(err));
            gh.next(gh.doneMsg());
          });
          child.stderr.pipe(process.stderr);
          feedGitHistory(gh, child.stdout);
        } else {
          feedGitHistory(gh, fs.createReadStream(config.file));
        }
      });
    });
    return gh;
  }
}
