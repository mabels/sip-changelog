import * as Rx from 'rxjs';

import { HeaderLine, HeaderLineFactory } from './header-line';
import { GitCommit } from '../msg/git-commit';
import { Commit } from '../header-lines/commit';
import { GitHistoryMsg } from '../msg/git-history-msg';

export class Parent extends Commit implements HeaderLine {
  public static readonly factory: HeaderLineFactory = {
    match: (m: string): boolean => 'parent' == m,
    create: (args: string, tid: string, ouS: Rx.Subject<GitHistoryMsg>) => new Parent(args, tid, ouS)
  };

  public assignCommit(commit: GitCommit): void {
    commit.parent = this;
  }
}
