import { HeaderLine, HeaderLineFactory } from './header-line';
import { GitCommit } from '../msg/git-commit';
import { Commit } from '../header-lines/commit';
import { MsgBus } from '../msg-bus';

export class Tree extends Commit implements HeaderLine {

  public static readonly factory: HeaderLineFactory = {
    match: (m: string): boolean => 'tree' === m,
    create: (args: string, tid: string, bus: MsgBus) => new Tree(args, tid, bus)
  };

  public assignCommit(commit: GitCommit): void {
    commit.tree = this;
  }

}
