import * as fs from 'fs';
import * as Rx from 'rxjs';
import * as yargs from 'yargs';
import { Readable } from 'stream';
import { exec } from 'child_process';

import { GitHistoryMsg } from '../msg/git-history-msg';
import { GitHistory } from '../git-history';
import { GitHistoryError } from '../msg/git-history-error';
import { GitHistoryDone } from '../msg/git-history-done';
import { Feed } from '../msg/feed';
import { FeedDone } from '../msg/feed-done';
import { GitHistoryStart } from '../msg/git-history-start';
import { GitCommit } from '../msg/git-commit';
import { GitCommitDone } from '../msg/git-commit-done';
import { GroupMsg } from '../msg/group-msg';
import { ChangeLog } from './change-log';

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

export namespace Cli {
  export function factory(args: string[]): GitHistory {
    const gh = new GitHistory();
    const y = yargs.usage('$0 <cmd> [args]');
    y.option('story-match', {
      describe: 'only take commits which are include story-match regex',
      type: 'array',
      default: ['']
    }).option('no-story-sort-numeric', {
      describe: 'do not sort stories by numeric identifier',
      default: false
    }).option('group-by-tag', {
      describe: 'group tags by group-by-tag regex',
      type: 'array',
      default: ['']
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
      });
    const config = y.parse(args);
    console.log(args, config);
    const changeLog = new ChangeLog({
      storyMatches: config.storyMatch,
      groupByTags: config.groupByTag,
      noStorySortNumeric: config.noStorySortNumeric
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
