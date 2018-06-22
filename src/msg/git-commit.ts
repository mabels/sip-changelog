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

export class GitCommit extends GitHistoryMsg {
  public commit?: Commit;
  public committer?: Committer;
  public author?: Author;
  public parent?: Parent;
  public tree?: Tree;
  public gpgsig?: GpgSig;
  public readonly message: Message;
  private readonly completeHandlers: (() => void)[] = [];

  public static is(msg: any): Match<GitCommit> {
    if (msg instanceof GitCommit) {
      return Match.create<GitCommit>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
    this.message = new Message();
  }

  public onComplete(cb: () => void): void {
    this.completeHandlers.push(cb);
  }

  public complete(): void {
    this.completeHandlers.forEach(cb => cb());
  }

}
