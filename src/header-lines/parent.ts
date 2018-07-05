import { HeaderLine, HeaderLineFactory } from './header-line';
import { GitCommit } from '../msg/git-commit';
import { Commit } from '../header-lines/commit';
import { MsgBus } from '../msg-bus';

export class Parent extends Commit implements HeaderLine {
  public static readonly factory: HeaderLineFactory = {
    match: (m: string): boolean => 'parent' == m,
    create: (args: string, tid: string, bus: MsgBus) => new Parent(args, tid, bus)
  };

  public assignCommit(commit: GitCommit): void {
    commit.parent = this;
  }
}
