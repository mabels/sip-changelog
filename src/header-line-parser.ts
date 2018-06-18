import { MetaLine, MetaLineFactory } from './meta-lines/meta-line';
import { Author } from './meta-lines/author';
import { Commit } from './meta-lines/commit';
import { Committer } from './meta-lines/committer';
import { Parent } from './meta-lines/parent';
import { Tree } from './meta-lines/tree';
import { GitCommit } from './msg/git-commit';

class DefautMetaLine implements MetaLine {

  public readonly error?: Error;

  constructor(errStr: string) {
    this.error = new Error(errStr);
  }

  public isOk(): boolean {
    return false;
  }

  public assignCommit(commit: GitCommit): void {
    throw new Error('not implemented');
  }

}

class DefaultFactory implements MetaLineFactory {
  public readonly name: string = 'default';

  public match(n: string): boolean {
    return true;
  }
  public create(a: string): MetaLine {
    return new DefautMetaLine(a);
  }
}

const metaLineFactory = [
  Author.factory,
  Commit.factory,
  Committer.factory,
  Parent.factory,
  Tree.factory,
  new DefaultFactory(),
];

export function HeaderLineParser(meta: string, args: string): MetaLine {
  return metaLineFactory.find(x => x.match(meta)).create(args);
}
