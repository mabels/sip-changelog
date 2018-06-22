import * as uuid from 'uuid';
import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';
import { Commit } from '../header-lines/commit';
import { Committer } from '../header-lines/committer';
import { Author } from '../header-lines/author';
import { Parent } from '../header-lines/parent';
import { Tree } from '../header-lines/tree';
import { GpgSig } from '../header-lines/gpg-sig';
import { Message } from '../header-lines/message';

export class GitCommitDone extends GitHistoryMsg {

  public static is(msg: any): Match<GitCommitDone> {
    if (msg instanceof GitCommitDone) {
      return Match.create<GitCommitDone>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }

}
