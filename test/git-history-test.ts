import * as fs from 'fs';
import * as uuid from 'uuid';
import * as Rx from 'rxjs';
import { exec } from 'child_process';
import * as execa from 'execa';
import { Readable } from 'stream';
import { assert } from 'chai';

import GitHistory from '../src/git-history';
import { Feed } from '../src/msg/feed';
import { FeedDone } from '../src/msg/feed-done';
import { GitHistoryDone } from '../src/msg/git-history-done';
import { GitCommit } from '../src/msg/git-commit';
import { GitHistoryError } from '../src/msg/git-history-error';
import { FeedLine } from '../src/msg/feed-line';
import { GitCommitParser } from '../src/git-commit-parser';
import { GitHistoryMsg } from '../src/msg/git-history-msg';

interface Action {
  fname: string;
  tid: string;
  gitCommitLength: number;
  feedLines: number;
}

describe('git-history', () => {

  function handleGitHistory(streamGitHistory: Readable, gh: GitHistory, action: Action, done: (a?: any) => void): void {
    streamGitHistory.on('data', (chunk) => {
      // console.error('data', action.fname);
      gh.next(new Feed(action.tid, chunk.toString()));
    }).on('end', () => {
      // console.error('end', action.fname);
      gh.next(new FeedDone(action.tid));
    }).on('error', err => {
      // console.error('error', err);
      try {
        assert.equal((<any>err)['path'], 'test/unknown.sample');
        assert.equal(action.fname, 'test/unknown.sample');
        done();
      } catch (e) {
        console.error(err);
        done(e);
      }
    });
  }

  function feedAction(action: Action, done: (a?: any) => void,
    assertCb: (ghs: GitCommit[]) => void = () => []): void {
    // console.log('feedAction', action);
    const gh = new GitHistory(action.tid);
    const gitCommits: GitCommit[] = [];
    let feedLines = 0;
    gh.subscribe((msg) => {
      // console.log(`feedAction:msg`, msg.constructor.name);
      GitHistoryError.is(msg).match(err => {
        try {
          console.error(err.error);
          assert.fail('Error should not called', err.tid);
        } catch (e) {
          // console.error('---1');
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
        // console.log(`feedAction:`, msg);
        try {
          if (action.feedLines >= 0) {
            assert.equal(feedLines, action.feedLines, `feedLines ${feedLines} ${action.feedLines}`);
          }
          if (action.gitCommitLength >= 0) {
            // tslint:disable-next-line:max-line-length
            assert.equal(gitCommits.length, action.gitCommitLength, `gitCommit ${gitCommits.length} ${action.gitCommitLength}`);
          }
          assertCb(gitCommits);
          done();
        } catch (e) {
          // console.error('---3', e);
          done(e);
        }
      });
    });
    // let streamGitHistory: fs.ReadStream;
    if (action.fname.startsWith('!')) {
      const child = exec(action.fname.slice(1), (err) => {
        done(err);
      });
      child.stderr.pipe(process.stderr);
      handleGitHistory(child.stdout, gh, action, done);
    } else {
      handleGitHistory(fs.createReadStream(action.fname), gh, action, done);
    }
  }

  it('feed from: test/empty-file.sample', (done) => {
    feedAction({
      fname: 'test/empty-file.sample',
      tid: uuid.v4(),
      gitCommitLength: 0,
      feedLines: 0
    }, done);

  });

  it('feed from: test/unknown.sample', (done) => {
    feedAction({
      fname: 'test/unknown.sample',
      tid: uuid.v4(),
      gitCommitLength: 0,
      feedLines: 0
    }, done);
  });

  it('feed from: test/git-history.sample', (done) => {
    feedAction({
      fname: 'test/git-history.sample',
      tid: uuid.v4(),
      gitCommitLength: 14,
      feedLines: 354
    }, done, (gitCommits: GitCommit[]) => {
      assert.equal(gitCommits.length, 14);
      assert.deepNestedInclude(gitCommits[0].author, {
        date: new Date('2018-06-27T19:30:07.000Z'),
        email: 'meno.abels@adviser.com',
        name: 'Meno Abels'
      });

      assert.deepNestedInclude(gitCommits[0].commit, {
        'sha': '72b3dacc9d679f271bc0d0f76252007170574c6c',
        'tags': [{
          'branch': 'refs/heads/master',
          'flag': 'HEAD'
        }, {
          'branch': 'refs/tags/tag-test',
          'flag': 'tag'
        }, {
          'branch': 'refs/remotes/origin/master',
          'flag': 'none'
        }]
      });
      assert.deepNestedInclude(gitCommits[0].committer, {
        date: new Date('2018-06-27T19:30:07.000Z'),
        email: 'meno.abels@adviser.com',
        name: 'Meno Abels'
      });
      assert.equal(gitCommits[0].gpgsig.signatur(), [
        '-----BEGIN PGP SIGNATURE-----',
        'Comment: GPGTools - http://gpgtools.org',
        '',
        'iQIzBAABCAAdFiEE941bVHqbsOihdMD1Bg/1PLOjKZIFAlsz5ckACgkQBg/1PLOj',
        'KZJ/2A/9HzbPKWxyXZ9i/Y8UaFTbRd/lIki+vkAV/jGN2LYW5AO4rsE2oEiMESUK',
        'OcehN5f2Lj/Tf5mvAa7YbocUIOuBOqPBzskC7vpTAfIa2062f6OkmPCyKpdBvzdc',
        'WsWSOdYURdNR1F9RRuvzrVQn7PRZnXsrUgXM6bfADaaXCQDyFxa0z0kcv5SctU+p',
        '0fFo6m9jHIbfSbYbjO50JsSktrRr3i0BmdDYaHghZdbo8omhQ08/MFiBM9iZAV4D',
        'MH7y0/+jahyHauWiEle8+2nGtbHx6Uw5M5Z2sBaOlre/kKoW8Lakk4Hxst3yQP7P',
        'SI2Kz3A8vqhryW1fh0PqBakrcYhgPsF1bxjCutwsmt5GbQAtGkQ2j40qF956fpAu',
        'VjT1s3cGSGv37vuQq4gu7wNJT9jlpFOxYk9x26A8kU1I9QSdh9tRaK0XSaJnhrDl',
        'xRZavK4tncVGQz5gW1BZGjRDGhMojBTeTPNbMBo37ucOUycNKYq333lsepv33N80',
        '0sbxIhSQ8PLj9pu7X02sOkc/4aKvqu3Csx2OBg8mQTsvIPEZm/r2BaJwZHM7iubz',
        'LrTmWBoy2nOJxhiXsAyQW2TFwAQZcFG7y1bWDjQbOMLgeEMfT8tGN8W2VwtpyHFm',
        'ui2ZuRAvyEi9cOAZrSCeVU7h3Vzem9bk0i4GrvhTVI8t9gqRv6o=',
        '=6Pb0',
        '-----END PGP SIGNATURE-----'
      ].join('\n'));
      assert.equal(gitCommits[0].message.text(), 'fix WIP-7');
      assert.deepNestedInclude(gitCommits[0].parent, {
        'sha': '70a9e7db53216f3a835c467e1677de484e93f7d4',
        'tags': []
      });
      assert.deepNestedInclude(gitCommits[0].tree, {
        'sha': 'a70612dfa4ee629924bc9079882f12d5b82abce2',
        'tags': []
      });
      assert.deepNestedInclude(gitCommits[1].author, {
        'date': new Date('2018-06-27T05:59:01.000Z'),
        'email': 'meno.abels@adviser.com',
        'name': 'Meno Abels'
      });
      assert.deepNestedInclude(gitCommits[1].commit, {
        'sha': '70a9e7db53216f3a835c467e1677de484e93f7d4',
        'tags': [{
          'branch': 'refs/remotes/origin/master',
          'flag': 'none'
        }, {
          'branch': 'refs/remotes/origin/HEAD',
          'flag': 'none'
        }]
      });
      assert.deepNestedInclude(gitCommits[1].committer, {
        'date': new Date('2018-06-27T05:59:01.000Z'),
        'email': 'meno.abels@adviser.com',
        'name': 'Meno Abels'
      });
      assert.equal(gitCommits[1].gpgsig.signatur(), [
        '-----BEGIN PGP SIGNATURE-----',
        'Comment: GPGTools - http://gpgtools.org',
        '',
        'iQIzBAABCAAdFiEE941bVHqbsOihdMD1Bg/1PLOjKZIFAlszJ68ACgkQBg/1PLOj',
        'KZJoRA//X/oITGYOJ6yQ6G97PA44kQU7EKryZOLoYGa2juiTweKZO/W4pBGw/UmO',
        '6Gv1zklM62LV6RWtoAPitIhVGLJvXuDfKeCbLO55XVNSUmGsp6WConUQVvwRc7kQ',
        's4CFVxABWl+D3zh2NwPjujR1hYn7X0wwIg8vbXGFgYtu9p7MdsFTtMIrsOkCAvYV',
        'NOymq2toY15j7G/YDUV8nLqMN0GYBJycHGYG7UT1Aws3rqazWddllAE0IDXXbGdI',
        '1FG4tWEfI2r+h9KxEBzp1jAB8T626a0OFWzVJZfhzDtGP5zWqdcDGZ3nXHUexICi',
        'klzjpW+FLAY3IXQcMxjB8sRl95fpB4uEmXRm7hfIppqV1K7Rb/7DajhzVnIkxDOe',
        '9Rv6Nzm5haeXC7f1fBBMJKb2mMEv7ghtjapYXC8HVBOJSjvrpZ9wbgEJjIulWKBT',
        'mDSoiS0g+G8Q0OvDAiULSTTmKq1nJhGF491WIQUU42NxHciFMcXmy++LAO97W2PD',
        '5IxiYZ8oqxi5wmElNFBpz7oqpinGfEwuGyIsyB5Lmsj3RTL9pRvmNRufkFjya9ry',
        'S+5UzgsbX500bZLGYsZNKl7I38CC5PXbJqJSHOz0v2xSuPJ+9Wdvj2Neip0zb14o',
        'WOTz3u4IFE36GdjVEUqETobVFDql4mbhQvnreacRx7EkRnO1XjI=',
        '=C8tu',
        '-----END PGP SIGNATURE-----'
      ].join('\n'));
      assert.equal(gitCommits[1].message.text(), 'fix WIP-1 missing alot of features');
      assert.deepNestedInclude(gitCommits[1].tree, {
        'sha': 'c9dd305873b3906aa9d439067f097c965eddb069',
        'tags': []
      });
    });
  });

  it('feed from: !git log --format=raw --decorate=full', async () => {
    const wcs = await execa.shell('git log --format=raw --decorate=full | wc -l');
    const commits = await execa.shell('git log --format=oneline | wc -l');
    return new Promise((rs, rj) => {
      feedAction({
        fname: '!git log --format=raw --decorate=full',
        tid: uuid.v4(),
        gitCommitLength: ~~commits.stdout,
        feedLines: ~~wcs.stdout,
      }, (a) => a ? rj() : rs(a));
    });
  });

  it('msg', (done) => {
    const ouS = new Rx.Subject<GitHistoryMsg>();
    const tid = uuid.v4();
    const gcp = new GitCommitParser(tid, ouS);
    const gitMsg = [
      '',
      '     ja ',
      '     nein ',
      '     weise ',
      '',
    ];
    const treeIds = ['4711', '4712'];
    let gitCommits = 0;
    ouS.subscribe(msg => {
      GitCommit.is(msg).hasTid(tid).match(gc => {
        // console.log(gitCommits, gc);
        try {
          assert.equal(gc.tree.sha, treeIds[gitCommits++]);
          assert.equal(gc.message.text(), gitMsg.slice(1, -1)
            .map(i => i.slice(4).replace(/\s+$/, '')).join('\n'));
          if (gitCommits >= treeIds.length) {
            done();
          }
        } catch (e) {
          done(e);
        }
      });
    });
    let treePos = 0;
    gcp.next(new FeedLine(tid, `tree ${treeIds[treePos++]}`));
    gitMsg.forEach(line => {
      gcp.next(new FeedLine(tid, line));
    });

    gcp.next(new FeedLine(tid, `tree ${treeIds[treePos++]}`));
    gitMsg.forEach(line => {
      gcp.next(new FeedLine(tid, line));
    });
    gcp.next(new FeedDone(tid));
  });

});
