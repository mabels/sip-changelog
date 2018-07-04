import { assert } from 'chai';
import * as Rx from 'rxjs';
import * as uuid from 'uuid';

import { GitCommit } from '../src/msg/git-commit';
import { ProcessHeader } from '../src/git-commit-parser';

import { matchHeaderLine } from '../src/header-line-parser';
import { GitHistoryMsg } from '../src/msg/git-history-msg';
import { TagFlag } from '../src/header-lines/tag';

describe('git-commit', () => {
  const ouS = new Rx.Subject<GitHistoryMsg>();
  const tid = uuid.v4();
  const testLineMatcher = new ProcessHeader(tid, ouS);
  it('commit-line', () => {
    const gc = new GitCommit('4711');
    const lm = matchHeaderLine(testLineMatcher, gc,
      // tslint:disable-next-line:max-line-length
      'commit f92c3e5351266d4f6d061d571b055bbcaf0497d6 (HEAD -> refs/heads/master, tag: refs/tags/tag-test, refs/heads/branch-test)',
      tid, ouS);
    const commit = gc.commit;
    assert.equal(gc.commit, commit);
    assert.isUndefined(commit.error);
    assert.equal(commit.sha, 'f92c3e5351266d4f6d061d571b055bbcaf0497d6');
    assert.deepEqual(commit.tags(TagFlag.ALL).map(i => i.toObj()), [
      {
        branch: 'refs/heads/master',
        error: undefined,
        flag: 'HEAD'
      }, {
        branch: 'refs/tags/tag-test',
        error: undefined,
        flag: 'TAG'
      }, {
        branch: 'refs/heads/branch-test',
        error: undefined,
        flag: 'NONE'
      }
    ]);
    assert.equal(commit.next(lm), testLineMatcher);
  });

  it('tree-line', () => {
    const gc = new GitCommit('4711');
    const lm = matchHeaderLine(testLineMatcher, gc,
      'tree ce0ce8fdc8899b3bcf2a7dc845a1bf5d3681fdd6',
      tid, ouS);
    const tree = gc.tree;
    assert.equal(gc.tree, tree);
    assert.isUndefined(tree.error);
    assert.equal(tree.sha, 'ce0ce8fdc8899b3bcf2a7dc845a1bf5d3681fdd6');
    assert.deepEqual(tree.tags(TagFlag.ALL), []);
    assert.equal(tree.next(lm), testLineMatcher);
  });
  it('parent-line', () => {
    const gc = new GitCommit('4711');
    const lm = matchHeaderLine(testLineMatcher, gc,
      'parent ce0ce8fdc8899b3bcf2a7dc845a1bf5d3681fdd6',
      tid, ouS);
    const parent = gc.parent;
    assert.equal(gc.parent, parent);
    assert.isUndefined(parent.error);
    assert.equal(parent.sha, 'ce0ce8fdc8899b3bcf2a7dc845a1bf5d3681fdd6');
    assert.deepEqual(parent.tags(TagFlag.ALL), []);
    assert.equal(parent.next(lm), testLineMatcher);
  });

  it('author-line', () => {
    const gc = new GitCommit('4711');
    const lm = matchHeaderLine(testLineMatcher, gc,
      'author Meno Abels <meno.abels@adviser.com> 1529257638 +0200',
      tid, ouS);
    const author = gc.author;
    assert.equal(gc.author, author);
    assert.isUndefined(author.error);
    assert.equal(author.name, 'Meno Abels');
    assert.equal(author.email, 'meno.abels@adviser.com');
    assert.equal(author.date.getTime(), new Date('2018-06-17T17:47:18.000Z').getTime());
    assert.equal(author.next(lm), testLineMatcher);
  });

  it('committer', () => {
    const gc = new GitCommit('4711');
    // tslint:disable-next-line:max-line-length
    const lm = matchHeaderLine(testLineMatcher, gc,
      'committer Meno Abels <meno.abels@adviser.com> 1529257638 +0200',
      tid, ouS);
    const committer = gc.committer;
    assert.equal(gc.committer, committer);
    assert.isUndefined(committer.error);
    assert.equal(committer.name, 'Meno Abels');
    assert.equal(committer.email, 'meno.abels@adviser.com');
    assert.equal(committer.date.getTime(), new Date('2018-06-17T17:47:18.000Z').getTime());
    assert.equal(committer.next(lm), testLineMatcher);
  });

  it('gpgsig', () => {
    const gc = new GitCommit('4711');
    const lm = matchHeaderLine(testLineMatcher, gc,
      'gpgsig -----BEGIN PGP SIGNATURE-----', tid, ouS);
    assert.isUndefined(gc.gpgsig);
    const mimeBlock = [
      ' Comment: GPGTools - http://gpgtools.org',
      '',
      ' iQIzBAABCAAdFiEE941bVHqbsOihdMD1Bg/1PLOjKZIFAlsmnrMACgkQBg/1PLOj',
      ' KZJqSg//dWd9xzQIUmAsYpgwe4Z0VyXcQdp3DUpoQ2L0ruMbi3+J45cwB3DfbriI',
      ' +saZekqaTioGGCtpYu6jJBDeP8IpjSYKeONkfsXto7fcgoXg7b45icbxISoiPSfA',
      ' dLjz60A1IXbLcKiquzY2ZzhSPNIkFLGqDe+yf7lBX0pvm+ufNGAFUj784I0DykFl',
      ' WOdVROdJA4G8DDA6UqzdoeUyZ21Yhpi+ql5pwkvEAPu+WRy9hDgOVP/pel2tyCW/',
      ' tduzJgYvjJOYHtPleT+k9usg1MM44gF6TrInka3jwEN6ft9f+/ymF0XxAKNHtQvU',
      ' pGzWIi9V4NptTHvoHwu4yUbNRtomUnfEIaTPvZZczmKILJWVl5H/R1n+uDPGOBOC',
      ' yvl+nhdVI2YMZhcrV6R05KfDwe0bzpoPeMQELayhivfMrSlSbGNcKqCAMRBvKcCG',
      ' y+PE9zklFLK8TmgTIy2f2b+gL1H9qhDqg7qdxgi/abVcgybPMpA0hpc22WZqDBnO',
      ' bshpQ1lbRnrFkT1pXtGb2/8P63etRvwiSgzX93AYTf7+1KakjAqYt5j/jh9kg21a',
      ' HWG/P01Xjus3B0AMiVHJPsp06nV1liCAUiu00wyJClJ0HnP9t/I+D9bSJ7gE2OlV',
      ' 9MfnkcuFFKnOx3gL+wZ/3Mjv6w6T/1EoJX5YvSeVV3PoSzDuB5I=',
      ' =0pyW'];
    let blm = lm;
    mimeBlock.forEach(line => {
      blm = blm.match(line);
    });
    assert.isUndefined(gc.gpgsig);
    assert.equal(blm.match(' -----END PGP SIGNATURE-----'), testLineMatcher);
    const gpgsig = gc.gpgsig;
    assert.isUndefined(gpgsig.error);
    assert.equal(gpgsig.signatur(), [
      '-----BEGIN PGP SIGNATURE-----',
      ...mimeBlock.map(i => i.trim()),
      '-----END PGP SIGNATURE-----'
    ].join('\n'));
  });

});
