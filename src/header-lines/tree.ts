import * as Rx from 'rxjs';

import { HeaderLine, HeaderLineFactory } from './header-line';
import { GitCommit } from '../msg/git-commit';
import { Commit } from '../header-lines/commit';
import { GitHistoryMsg } from '../msg/git-history-msg';

export class Tree extends Commit implements HeaderLine {

  public static readonly factory: HeaderLineFactory = {
    match: (m: string): boolean => 'tree' === m,
    create: (args: string, tid: string, ouS: Rx.Subject<GitHistoryMsg>) => new Tree(args, tid, ouS)
  };

  public assignCommit(commit: GitCommit): void {
    commit.tree = this;
  }

}
