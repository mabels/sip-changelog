import { MetaLine, MetaLineFactory } from './meta-line';
import { GitCommit } from './msg/git-commit';

export class Parent implements MetaLine {
  public static readonly factory: MetaLineFactory = {
    name: 'parent',
    create: (args: string) => new Parent(args)
  };

  public readonly parent: string;

  constructor(args: string) {
    // parent 0851ec268bcd8e6f49a0a83237fb1091472abe2b
    this.parent = args.trim();
  }

  public assignCommit(commit: GitCommit): void {
    commit.parent = this;
  }
}
