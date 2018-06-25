import * as fs from 'fs';
import * as uuid from 'uuid';
import * as Rx from 'rxjs';
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
import { GitCommitParser } from '../src/git-commit-parser';
import { RSA_X931_PADDING } from 'constants';
import { GitHistoryMsg } from '../src/msg/git-history-msg';

// import { GitCommit } from '../src/git-commit';

interface Action {
  fname: string;
  tid: string;
  gitCommitLength: number;
  feedLines: number;
}

describe('git-history', () => {

  function handleGitHistory(streamGitHistory: Readable, gh: GitHistory, action: Action, done: (a?: any) => void): void {
    streamGitHistory.on('data', (chunk) => {
      //  console.error('data', action.fname);
       gh.next(new Feed(action.tid, chunk.toString()));
    }).on('end', () => {
      //  console.error('end', action.fname);
       gh.next(new FeedDone(action.tid));
    }).on('error', err => {
      try {
        assert.equal(action.fname, 'test/unknown.sample');
        done();
      } catch (e) {
        // console.error(err);
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
      // console.log(`feedAction:msg`, msg);
      GitHistoryError.is(msg).match(err => {
        try {
          // console.error(err.data);
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
          // console.error('---3');
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
      gitCommitLength: 2,
      feedLines: 48
    }, done, (gitCommits: GitCommit[]) => {
      assert.equal(gitCommits.length, 2);
      assert.deepNestedInclude(gitCommits[0].author, {
            date: new Date('2018-06-17T17:47:18.000Z'),
            email: 'meno.abels@adviser.com',
            name: 'Meno Abels'
          });

      assert.deepNestedInclude(gitCommits[0].commit, {
            'sha': 'f92c3e5351266d4f6d061d571b055bbcaf0497d6',
            'tags': [
              {
                'branch': 'refs/heads/master',
                'flag': 'HEAD'
              }, {
                'branch': 'refs/tags/tag-test',
                'flag': 'tag'
              }, {
                'branch': 'refs/heads/branch-test',
                'flag': 'none'
              }
            ]
          });
         assert.deepNestedInclude(gitCommits[0].committer, {
            date: new Date('2018-06-17T17:47:18.000Z'),
            email: 'meno.abels@adviser.com',
            name: 'Meno Abels'
          });
         assert.equal(gitCommits[0].gpgsig.signatur(), [
                  '-----BEGIN PGP SIGNATURE-----',
                  'Comment: GPGTools - http://gpgtools.org',
                  '',
                  'iQIzBAABCAAdFiEE941bVHqbsOihdMD1Bg/1PLOjKZIFAlsmnrMACgkQBg/1PLOj',
                  'KZJqSg//dWd9xzQIUmAsYpgwe4Z0VyXcQdp3DUpoQ2L0ruMbi3+J45cwB3DfbriI',
                  '+saZekqaTioGGCtpYu6jJBDeP8IpjSYKeONkfsXto7fcgoXg7b45icbxISoiPSfA',
                  'dLjz60A1IXbLcKiquzY2ZzhSPNIkFLGqDe+yf7lBX0pvm+ufNGAFUj784I0DykFl',
                  'WOdVROdJA4G8DDA6UqzdoeUyZ21Yhpi+ql5pwkvEAPu+WRy9hDgOVP/pel2tyCW/',
                  'tduzJgYvjJOYHtPleT+k9usg1MM44gF6TrInka3jwEN6ft9f+/ymF0XxAKNHtQvU',
                  'pGzWIi9V4NptTHvoHwu4yUbNRtomUnfEIaTPvZZczmKILJWVl5H/R1n+uDPGOBOC',
                  'yvl+nhdVI2YMZhcrV6R05KfDwe0bzpoPeMQELayhivfMrSlSbGNcKqCAMRBvKcCG',
                  'y+PE9zklFLK8TmgTIy2f2b+gL1H9qhDqg7qdxgi/abVcgybPMpA0hpc22WZqDBnO',
                  'bshpQ1lbRnrFkT1pXtGb2/8P63etRvwiSgzX93AYTf7+1KakjAqYt5j/jh9kg21a',
                  'HWG/P01Xjus3B0AMiVHJPsp06nV1liCAUiu00wyJClJ0HnP9t/I+D9bSJ7gE2OlV',
                  '9MfnkcuFFKnOx3gL+wZ/3Mjv6w6T/1EoJX5YvSeVV3PoSzDuB5I=',
                  '=0pyW',
                  '-----END PGP SIGNATURE-----'
         ].join('\n'));
         assert.equal(gitCommits[0].message.text(), '* WIP');
         assert.deepNestedInclude(gitCommits[0].parent, {
                'sha': '7c183b29ba6e8c2d126fda11d52cd20321aa59a6',
                'tags': []
              });
         assert.deepNestedInclude(gitCommits[0].tree, {
                'sha': 'ce0ce8fdc8899b3bcf2a7dc845a1bf5d3681fdd6',
                'tags': []
              });
          assert.deepNestedInclude(gitCommits[1].author, {
               'date': new Date('2018-06-15T13:16:31.000Z'),
               'email': 'meno.abels@adviser.com',
               'name': 'Meno Abels'
             });
          assert.deepNestedInclude(gitCommits[1].commit, {
               'sha': '7c183b29ba6e8c2d126fda11d52cd20321aa59a6',
               'tags': [
                 {
                   'branch': 'refs/remotes/origin/master',
                   'flag': 'none'
                 }, {
                   'branch': 'refs/remotes/origin/HEAD',
                   'flag': 'none'
                 }
               ]
             });
             assert.deepNestedInclude(gitCommits[1].committer, {
               'date': new Date('2018-06-15T13:16:31.000Z'),
               'email': 'meno.abels@adviser.com',
               'name': 'Meno Abels'
             });
             assert.equal(gitCommits[1].gpgsig.signatur(), [
                   '-----BEGIN PGP SIGNATURE-----',
                   'Comment: GPGTools - http://gpgtools.org',
                   '',
                   'iQIzBAABCAAdFiEE941bVHqbsOihdMD1Bg/1PLOjKZIFAlsjvDgACgkQBg/1PLOj',
                   'KZK0wQ//TyTEUJ/PZ/85pmDDf4vUpVqXIcCK38QKlcDoRglGxqQr1Y8SasrMB9YV',
                   'VAcReaJucKnOlmAwvrBvi/37SOvldGjVGOy9RGaQ+rJPYacsU9cLTRBgpi8vBfrx',
                   '3bbLXO+3doVCtmXwgC8KmoFWWctYbjMUuJQOk50Czse11P4UNjVd0BDnTgy/Idwz',
                   '2YBBlTc2Zp65HIHlfQbYeLlI0/ukG2tDbNm3EZ+gmR9jxgEGH7b1/SZJpiClbr1U',
                   'cDr+6EkrEOMlFJjz2DCPcnveL1JUWHYkRUVyVsiTEx7pxE8KQpRROSy1SkykUEd5',
                   'sxj7Ikr6zHsyJkd2j6fvcVKT3B5DiGD6aE3ij9fsRNqud8/sLHHK2Laaq1dM6rUV',
                   'eX46/xSzsu82Ik7ApUmpPWykfv46jsPXiIdxUto6dGXrhdlVV4onJmOJb8pHXFPn',
                   'NW4pTw8uNmSuu4OeuTRmvQCp4GPoeokYHQLFkFZtOUQ5kVNDQEFkIFvGz9iIgpdp',
                   'GIyt41EFk0wSQBNjO5md0PHM7N8PnZ0iqo3w5HsTDB+oOQyo2rScod4qPjdBSlhq',
                   'GyPGs+Zmor3NThmWLHEzobJd+9PR5bz54EIIuNPXWLwN2Sr5ic0V4nCwiPG0I45V',
                   'BwijLZH7I6KcUQZRS8iIVLGX4RwN/oMbK4NaH2++SIfxSwIYMOM=',
                   '=EQLV',
                   '-----END PGP SIGNATURE-----'
                 ].join('\n'));
             assert.equal(gitCommits[1].message.text(), '* initial release');
             assert.deepNestedInclude(gitCommits[1].tree, {
               'sha': '09bf7baa213658a7f5581e0e835828fa1973b71d',
               'tags': []
             });
           });
        });

  it('feed from: !git log --format=raw --decorate=full', (done) => {
    feedAction({
      fname: '!git log --format=raw --decorate=full',
      tid: uuid.v4(),
      gitCommitLength: 0,
      feedLines: 0
    }, done);
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
          assert.equal(gc.message.text(), gitMsg.slice(1, -1).map(i => i.slice(4)).join('\n'));
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
