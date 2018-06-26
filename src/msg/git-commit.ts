import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';
import { Commit } from '../header-lines/commit';
import { Committer } from '../header-lines/committer';
import { Author } from '../header-lines/author';
import { Parent } from '../header-lines/parent';
import { Tree } from '../header-lines/tree';
import { GpgSig } from '../header-lines/gpg-sig';
import { Message } from '../header-lines/message';
import { GroupMsg } from './group-msg';
import { StoriesContainerInit } from './stories-container';

export class GitCommit extends GitHistoryMsg {
  public commit?: Commit;
  public committer?: Committer;
  public author?: Author;
  public parent?: Parent;
  public tree?: Tree;
  public gpgsig?: GpgSig;
  public readonly message: Message;
  private readonly completeHandlers: ((gc: GitCommit) => void)[] = [];

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

  public onComplete(cb: (gc: GitCommit) => void): void {
    this.completeHandlers.push(cb);
  }

  public isComplete(): boolean {
    return this.message.lines.length > 0 &&
      (!!this.commit || !!this.committer || !!this.author ||
        !!this.parent || !!this.tree || !!this.gpgsig);
  }

  public complete(): void {
    this.completeHandlers.forEach(cb => cb(this));
  }

  public groupMsg(group: string, sci: StoriesContainerInit): GroupMsg {
    return new GroupMsg(this.tid, group, sci);
  }

}
