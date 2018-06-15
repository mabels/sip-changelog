import { MetaLine, MetaLineFactory } from './meta-line';
import { GitCommit } from './msg/git-commit';

export class Tree implements MetaLine {

  public static readonly factory: MetaLineFactory = {
    name: 'tree',
    create: (args: string) => new Tree(args)
  };

  public tree: string;

  constructor(args: string) {
    // tree ce9ea68e1b46d12997084474a900a5597d8ab858
    this.tree = args.trim();
  }

  public assignCommit(commit: GitCommit): void {
    commit.tree = this;
  }
}
