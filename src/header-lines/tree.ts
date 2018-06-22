import { HeaderLine, HeaderLineFactory } from './header-line';
import { GitCommit } from '../msg/git-commit';
import { Commit } from '../header-lines/commit';

export class Tree extends Commit implements HeaderLine {

  public static readonly factory: HeaderLineFactory = {
    match: (m: string): boolean => 'tree' == m,
    create: (args: string) => new Tree(args)
  };

  public assignCommit(commit: GitCommit): void {
    commit.tree = this;
  }

}
