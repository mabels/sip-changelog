import { MetaLine, MetaLineFactory } from './meta-line';
import { Author } from './author';
import { Commit } from './commit';
import { Committer } from './committer';
import { Parent } from './parent';

class Default implements MetaLineFactory {
  public readonly name: string = 'default';

  public match(n: string): boolean {
    return true;
  }
  public create(a: string): MetaLine {
    return null;
  }
}

const metaLineFactory = [
  Author.factory,
  Commit.factory,
  Committer.factory,
  Parent.factory,
  new Default(),
];

export function MetaLineParser(meta: string, args: string): MetaLine {
  return metaLineFactory.find(x => x.match(meta)).create(args);
}
