import * as fs from 'fs';
import * as uuid from 'uuid';
import { exec } from 'child_process';
import { Readable } from 'stream';
import { assert } from  'chai';

import GitHistory from '../src/git-history';
import { Feed } from '../src/msg/feed';
import { FeedDone } from '../src/msg/feed-done';
import { GitHistoryDone } from '../src/msg/git-history-done';
import { GitCommit } from '../src/msg/git-commit';
import { GitHistoryError } from '../src/msg/git-history-error';
import { FeedLine } from '../src/msg/feed-line';

// import { GitCommit } from '../src/git-commit';

interface Action {
  fname: string;
  tid: string;
  gitCommitLength: number;
  feedLines: number;
}

describe('git-history', () => {

  function handleGitHistory(streamGitHistory: Readable,
    actions: Action[], gh: GitHistory, action: Action, done: (a?: any) => void): void {
    streamGitHistory.on('data', (chunk) => {
      //  console.error('data', action.fname);
       gh.next(new Feed(action.tid, chunk.toString()));
    }).on('end', () => {
       console.error('end', action.fname);
       gh.next(new FeedDone(action.tid));
    }).on('error', err => {
      try {
        assert.equal(action.fname, 'test/unknown.sample');
        feedAction(actions, gh, done);
      } catch (e) {
        console.error(err);
        done(e);
      }
    });
  }

  function feedAction(actions: Action[], gh: GitHistory, done: (a?: any) => void): void {
    const action = actions.shift();
    // console.log('feedAction', action);
    if (!action) {
      done();
    }
    const gitCommits: GitCommit[] = [];
    let feedLines = 0;
    gh.subscribe((msg) => {
      GitHistoryError.is(msg).match(err => {
        try {
          console.error(err.data);
          assert.fail('Error should not called', err.tid);
        } catch (e) {
          console.error('---1');
          done(e);
        }
      });
      GitCommit.is(msg).hasTid(action.tid).match(item => {
        gitCommits.push(item);
      });
      FeedLine.is(msg).hasTid(action.tid).match(feedLine => {
        ++feedLines;
      });
      GitHistoryDone.is(msg).hasTid(action.tid).match(_ => {
        try {
          if (action.feedLines > 0) {
            assert.equal(feedLines, action.feedLines, 'feedLines');
          }
          assert.equal(gitCommits.length, action.gitCommitLength, 'gitCommitLength');
          feedAction(actions, gh, done);
        } catch (e) {
          console.error('---3');
          done(e);
        }
      });
    });
    let streamGitHistory: fs.ReadStream;
    if (action.fname.startsWith('!')) {
      const child = exec(action.fname.slice(1), (err) => {
        done(err);
      });
      child.stderr.pipe(process.stderr);
      handleGitHistory(child.stdout, actions, gh, action, done);
    } else {
      handleGitHistory(fs.createReadStream(action.fname), actions, gh, action, done);
    }
  }

  it('feed single line to history', (done) => {
    const gh = new GitHistory();
    feedAction([
      { fname: 'test/empty-file.sample', tid: uuid.v4(), gitCommitLength: 0, feedLines: 0 },
      { fname: 'test/unknown.sample', tid: uuid.v4(), gitCommitLength: 0, feedLines: 0 },
      { fname: 'test/git-history.sample', tid: uuid.v4(), gitCommitLength: 47, feedLines: 48 },
      { fname: '!git log --format=raw  --decorate=full', tid: uuid.v4(), gitCommitLength: 47, feedLines: -1 }
    ], gh, (d) => console.log('DONE', d));
  });
});
