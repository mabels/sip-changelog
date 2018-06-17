import * as fs from 'fs';
import * as uuid from 'uuid';

import GitHistory from '../src/git-history';
import { Feed } from '../src/msg/feed';
import { FeedDone } from '../src/msg/feed-done';
import { GitHistoryDone } from '../src/msg/git-history-done';
import { GitCommit } from '../src/msg/git-commit';
import { GitHistoryError } from '../src/msg/git-history-error';
import { assert } from  'chai';
import { FeedLine } from '../src/msg/feed-line';
// import { GitCommit } from '../src/git-commit';

interface Action {
  fname: string;
  tid: string;
  gitCommitLength: number;
  feedLines: number;
}

describe('git-history', () => {

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
          assert.equal(feedLines, action.feedLines, 'feedLines');
          assert.equal(gitCommits.length, action.gitCommitLength, 'gitCommitLength');
          feedAction(actions, gh, done);
        } catch (e) {
          console.error('---3');
          done(e);
        }
      });
    });
    const streamGitHistory = fs.createReadStream(action.fname);
    streamGitHistory.on('data', (chunk) => {
      //  console.error('data', action.fname);
       gh.next(new Feed(action.tid, chunk));
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

  it('feed single line to history', (done) => {
    const gh = new GitHistory();
    feedAction([
      { fname: 'test/empty-file.sample', tid: uuid.v4(), gitCommitLength: 0, feedLines: 0 },
      { fname: 'test/unknown.sample', tid: uuid.v4(), gitCommitLength: 0, feedLines: 0 },
      { fname: 'test/git-history.sample', tid: uuid.v4(), gitCommitLength: 47, feedLines: 17769 }
    ], gh, (d) => console.log('DONE', d));
  });
});
