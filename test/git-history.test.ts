// import * as fs from 'fs';
import * as uuid from 'uuid';
// import { exec } from 'child_process';
import * as execa from 'execa';
// import { Readable } from 'stream';
import { assert } from 'chai';

// import { FeedChunk } from '../src/msg/feed-chunk';
import { LineDone } from '../src/msg/line-done';
// import { GitHistoryDone } from '../src/msg/git-history-done';
import { GitCommit } from '../src/msg/git-commit';
import { GitHistoryError } from '../src/msg/git-history-error';
import { LineLine } from '../src/msg/line-line';
import { MsgBus } from '../src/msg-bus';
import { CliProcessor } from '../src/processors/cli-processor';
import { StreamProcessor } from '../src/processors/stream-processor';
import { LineProcessor } from '../src/processors/line-processor';
import { GitCommitProcessor } from '../src/processors/git-commit-processor';
import { LineOpen } from '../src/msg/line-open';
import { CliArgs } from '../src/msg/cli-args';
// import { triggerId } from 'async_hooks';
// import { StreamData } from '../src/msg/stream-data';
// import { StreamDone } from '../src/msg/stream-done';
// import { StreamOpen } from '../src/msg/stream-open';
import { GitCommitDone } from '../src/msg/git-commit-done';

interface Action {
  fname: string;
  tid: string;
  gitCommitLength: number;
  feedLines: number;
}

describe('git-history', () => {

  /*
  function handleGitHistory(streamGitHistory: Readable, bus: MsgBus, action: Action, done: (a?: any) => void): void {
    bus.next(new StreamOpen(action.tid, streamGitHistory));
    streamGitHistory.on('data', (chunk) => {
      // console.error('data', action.fname);
      bus.next(new StreamData(action.tid, chunk.toString()));
    }).on('end', () => {
      // console.error('end', action.fname);
      bus.next(new StreamDone(action.tid));
    }).on('error', err => {
        done(err);
    });
  }
  */
  function feedAction(action: Action, done: (a?: any) => void,
    assertCb: (ghs: GitCommit[]) => void = () => []): void {
    // console.log('feedAction', action);
    const tid = action.tid;
    const bus = new MsgBus();
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    GitCommitProcessor.create(bus);
    const gitCommits: GitCommit[] = [];
    let feedLines = 0;
    bus.subscribe((msg) => {
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
      LineLine.is(msg).hasTid(action.tid).match(feedLine => {
        ++feedLines;
      });
      GitCommitDone.is(msg).hasTid(action.tid).match(_ => {
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
          console.error('---3', e);
          done(e);
        }
      });
    });
    // let streamGitHistory: fs.ReadStream;
    if (action.fname.startsWith('!')) {
      bus.next(new CliArgs(tid, ['x', 'y',
        '--git-cmd', action.fname.slice(1).split(/\s+/)[0],
        '--git-options', action.fname.slice(1).split(/\s+/).slice(1).join(' ')]));
    } else {
      bus.next(new CliArgs(tid, ['x', 'y', '--file', action.fname]));
    }
  }

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

      assert.deepNestedInclude(gitCommits[0].commit.toObj(), {
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
      assert.deepNestedInclude(gitCommits[0].parent.toObj(), {
        'sha': '70a9e7db53216f3a835c467e1677de484e93f7d4',
        'tags': []
      });
      assert.deepNestedInclude(gitCommits[0].tree.toObj(), {
        'sha': 'a70612dfa4ee629924bc9079882f12d5b82abce2',
        'tags': []
      });
      assert.deepNestedInclude(gitCommits[1].author, {
        'date': new Date('2018-06-27T05:59:01.000Z'),
        'email': 'meno.abels@adviser.com',
        'name': 'Meno Abels'
      });
      assert.deepNestedInclude(gitCommits[1].commit.toObj(), {
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
      assert.deepNestedInclude(gitCommits[1].tree.toObj(), {
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
    const bus = new MsgBus();
    const tid = uuid.v4();
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    GitCommitProcessor.create(bus);
    const gitMsg = [
      '',
      '     ja ',
      '     nein ',
      '     weise ',
      '',
    ];
    const treeIds = ['4711', '4712'];
    let gitCommits = 0;
    bus.subscribe(msg => {
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
    bus.next(new LineOpen(tid));
    bus.next(new LineLine(tid, `tree ${treeIds[treePos++]}`));
    gitMsg.forEach(line => {
      bus.next(new LineLine(tid, line));
    });

    bus.next(new LineLine(tid, `tree ${treeIds[treePos++]}`));
    gitMsg.forEach(line => {
      bus.next(new LineLine(tid, line));
    });
    bus.next(new LineDone(tid));
  });

});
