import * as uuid from 'uuid';
import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';
import { Commit } from '../meta-lines/commit';
import { Committer } from '../meta-lines/committer';
import { Author } from '../meta-lines/author';
import { Parent } from '../meta-lines/parent';
import { Tree } from '../meta-lines/tree';
import { GpgSig } from '../meta-lines/gpg-sig';

export class GitCommit extends GitHistoryMsg {
  public commit: Commit;
  public committer?: Committer;
  public author?: Author;
  public parent?: Parent;
  public tree?: Tree;
  public gpgsig?: GpgSig;

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
