import { MetaLine, MetaLineFactory } from './meta-line';
import { GitCommit } from './msg/git-commit';
import { Commit } from './commit';

export class Parent extends Commit implements MetaLine {
  public static readonly factory: MetaLineFactory = {
    match: (m: string): boolean => 'parent' == m,
    create: (args: string) => new Parent(args)
  };

  public assignCommit(commit: GitCommit): void {
    commit.parent = this;
  }
}
