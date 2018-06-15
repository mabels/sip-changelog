import * as uuid from 'uuid';
import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';
import { Commit } from '../commit';
import { Committer } from '../committer';
import { Author } from '../author';
import { Parent } from '../parent';
import { Tree } from '../tree';

export class GitCommit extends GitHistoryMsg {
  public commit: Commit;
  public committer?: Committer;
  public author?: Author;
  public parent?: Parent;
  public tree?: Tree;

  public static is(msg: any): Match<GitCommit> {
    if (msg instanceof GitCommit) {
      return Match.create<GitCommit>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }

}
