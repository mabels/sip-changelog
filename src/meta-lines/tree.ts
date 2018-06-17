import { MetaLine, MetaLineFactory } from '../meta-line';
import { GitCommit } from '../msg/git-commit';
import { Commit } from '../meta-lines/commit';

export class Tree extends Commit implements MetaLine {

  public static readonly factory: MetaLineFactory = {
    match: (m: string): boolean => 'tree' == m,
    create: (args: string) => new Tree(args)
  };

  public assignCommit(commit: GitCommit): void {
    commit.tree = this;
  }

}
