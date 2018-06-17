import { assert } from  'chai';

import { Commit } from '../src/meta-lines/commit';
import { Parent } from '../src/meta-lines/parent';
import { GitCommit } from '../src/msg/git-commit';
import { Tree } from '../src/meta-lines/tree';
import { Author } from '../src/meta-lines/author';
import { Committer } from '../src/meta-lines/committer';

describe('git-commit', () => {
    it('commit-line', () => {
        // tslint:disable-next-line:max-line-length
        const commit = new Commit('f92c3e5351266d4f6d061d571b055bbcaf0497d6 (HEAD -> refs/heads/master, tag: refs/tags/tag-test, refs/heads/branch-test)');
        const gc = new GitCommit('4711');
        commit.assignCommit(gc);
        assert.equal(gc.commit, commit);
        assert.isUndefined(commit.error);
        assert.equal(commit.sha, 'f92c3e5351266d4f6d061d571b055bbcaf0497d6');
        assert.deepEqual(commit.tags, [
            {
              branch: 'refs/heads/master',
              flag: 'HEAD'
            }, {
              branch: 'refs/tags/tag-test',
              flag: 'tag'
            }, {
              branch: 'refs/heads/branch-test',
              flag: 'none'
            }
        ]);
    });
    it('tree-line', () => {
        const tree = new Tree('ce0ce8fdc8899b3bcf2a7dc845a1bf5d3681fdd6');
        const gc = new GitCommit('4711');
        tree.assignCommit(gc);
        assert.equal(gc.tree, tree);
        assert.isUndefined(tree.error);
        assert.equal(tree.sha, 'ce0ce8fdc8899b3bcf2a7dc845a1bf5d3681fdd6');
        assert.deepEqual(tree.tags, []);
    });
    it('parent-line', () => {
        const parent = new Parent('ce0ce8fdc8899b3bcf2a7dc845a1bf5d3681fdd6');
        const gc = new GitCommit('4711');
        parent.assignCommit(gc);
        assert.equal(gc.parent, parent);
        assert.isUndefined(parent.error);
        assert.equal(parent.sha, 'ce0ce8fdc8899b3bcf2a7dc845a1bf5d3681fdd6');
        assert.deepEqual(parent.tags, []);
    });

    it('author-line', () => {
        const author = new Author('Meno Abels <meno.abels@adviser.com> 1529257638 +0200');
        const gc = new GitCommit('4711');
        author.assignCommit(gc);
        assert.equal(gc.author, author);
        assert.isUndefined(author.error);
        assert.equal(author.name, 'Meno Abels');
        assert.equal(author.email, 'meno.abels@adviser.com');
        assert.equal(author.date.getTime(), new Date('2018-06-17T17:47:18.000Z').getTime());
    });

    it('committer', () => {
        const committer = new Committer('Meno Abels <meno.abels@adviser.com> 1529257638 +0200');
        const gc = new GitCommit('4711');
        committer.assignCommit(gc);
        assert.equal(gc.committer, committer);
        assert.isUndefined(committer.error);
        assert.equal(committer.name, 'Meno Abels');
        assert.equal(committer.email, 'meno.abels@adviser.com');
        assert.equal(committer.date.getTime(), new Date('2018-06-17T17:47:18.000Z').getTime());
    });

    /*
gpgsig -----BEGIN PGP SIGNATURE-----
 Comment: GPGTools - http://gpgtools.org

 iQIzBAABCAAdFiEE941bVHqbsOihdMD1Bg/1PLOjKZIFAlsmnrMACgkQBg/1PLOj
 KZJqSg//dWd9xzQIUmAsYpgwe4Z0VyXcQdp3DUpoQ2L0ruMbi3+J45cwB3DfbriI
 +saZekqaTioGGCtpYu6jJBDeP8IpjSYKeONkfsXto7fcgoXg7b45icbxISoiPSfA
 dLjz60A1IXbLcKiquzY2ZzhSPNIkFLGqDe+yf7lBX0pvm+ufNGAFUj784I0DykFl
 WOdVROdJA4G8DDA6UqzdoeUyZ21Yhpi+ql5pwkvEAPu+WRy9hDgOVP/pel2tyCW/
 tduzJgYvjJOYHtPleT+k9usg1MM44gF6TrInka3jwEN6ft9f+/ymF0XxAKNHtQvU
 pGzWIi9V4NptTHvoHwu4yUbNRtomUnfEIaTPvZZczmKILJWVl5H/R1n+uDPGOBOC
 yvl+nhdVI2YMZhcrV6R05KfDwe0bzpoPeMQELayhivfMrSlSbGNcKqCAMRBvKcCG
 y+PE9zklFLK8TmgTIy2f2b+gL1H9qhDqg7qdxgi/abVcgybPMpA0hpc22WZqDBnO
 bshpQ1lbRnrFkT1pXtGb2/8P63etRvwiSgzX93AYTf7+1KakjAqYt5j/jh9kg21a
 HWG/P01Xjus3B0AMiVHJPsp06nV1liCAUiu00wyJClJ0HnP9t/I+D9bSJ7gE2OlV
 9MfnkcuFFKnOx3gL+wZ/3Mjv6w6T/1EoJX5YvSeVV3PoSzDuB5I=
 =0pyW
 -----END PGP SIGNATURE-----
*/
});
