import { MetaLine, MetaLineFactory } from './meta-line';
import { Author } from './author';
import { Commit } from './commit';
import { Committer } from './committer';
import { Parent } from './parent';

const metaLineFactory = [
  Author.factory,
  Commit.factory,
  Committer.factory,
  Parent.factory,
];

const defaultFactory: MetaLineFactory = {
  name: null,
  create: (a: string): MetaLine => null
};

export function MetaLineParser(meta: string, args: string): MetaLine {
  return (metaLineFactory.find(x => x.name === meta) || defaultFactory).create(args);
}
