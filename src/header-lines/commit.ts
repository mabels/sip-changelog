import * as Rx from 'rxjs';

import { HeaderLine, HeaderLineFactory } from './header-line';
import { GitCommit } from '../msg/git-commit';
import { Tag } from './tag';
import { LineMatcher } from '../line-matcher';
import { GitHistoryMsg } from '../msg/git-history-msg';

const RECommit = /^(\S+)(\s+\((.*)\))*$/;
export class Commit implements HeaderLine {

  public static readonly factory: HeaderLineFactory = {
    match: (m: string): boolean => 'commit' == m,
    create: (args: string, tid: string, ouS: Rx.Subject<GitHistoryMsg>) => new Commit(args, tid, ouS)
  };

  public readonly error?: Error;
  public readonly sha: string;
  public readonly tags: Tag[];

  constructor(args: string, tid: string, ouS: Rx.Subject<GitHistoryMsg>) {
    // tslint:disable-next-line:max-line-length
    // commit 53ab23fcf1c5d0bcca04a6f287cf2d70bb1bb4f7 (HEAD -> refs/heads/rb-release_2.0, refs/remotes/origin/rb-release_2.0, refs/remotes/origin/integration-release)
    const matched = args.match(RECommit);
    if (!matched) {
        this.error = new Error(`Commit not parsable:${args}`);
        return;
    }
    this.sha = matched[1];
    if (matched[3]) {
      this.tags = Tag.parse(matched[3], tid, ouS);
    } else {
      this.tags = [];
    }
  }

  public assignCommit(commit: GitCommit): void {
    commit.commit = this;
  }

  public isOk(): boolean {
    return !this.error && !this.tags.find(i => !i.isOk);
  }

  public next(nx: LineMatcher): LineMatcher {
    return nx;
  }
}
