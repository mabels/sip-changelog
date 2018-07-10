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
import { CliConfig } from './cli-config';

export class GitCommit extends GitHistoryMsg {
  public commit?: Commit;
  public committer?: Committer;
  public author?: Author;
  public parent?: Parent;
  public tree?: Tree;
  public gpgsig?: GpgSig;
  public readonly message: Message;

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

  public isComplete(): boolean {
    return this.message.lines.length > 0 &&
      (!!this.commit || !!this.committer || !!this.author ||
        !!this.parent || !!this.tree || !!this.gpgsig);
  }

  public groupMsg(name: string[], sci: CliConfig): GroupMsg {
    return new GroupMsg(this.tid, name, sci);
  }

}
