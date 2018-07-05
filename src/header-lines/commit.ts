import { HeaderLine, HeaderLineFactory } from './header-line';
import { GitCommit } from '../msg/git-commit';
import { Tag, TagFlag } from './tag';
import { LineMatcher } from '../line-matcher';
import { MsgBus } from '../msg-bus';

export interface CommitObj {
  readonly error?: Error;
  readonly sha: string;
  readonly tags: Tag[];
}

const RECommit = /^(\S+)(\s+\((.*)\))*$/;
export class Commit implements HeaderLine {

  public static readonly factory: HeaderLineFactory = {
    match: (m: string): boolean => 'commit' == m,
    create: (args: string, tid: string, bus: MsgBus) => new Commit(args, tid, bus)
  };

  public readonly error?: Error;
  public readonly sha: string;
  private readonly _tags: Tag[];

  constructor(args: string, tid: string, bus: MsgBus) {
    // tslint:disable-next-line:max-line-length
    // commit 53ab23fcf1c5d0bcca04a6f287cf2d70bb1bb4f7 (HEAD -> refs/heads/rb-release_2.0, refs/remotes/origin/rb-release_2.0, refs/remotes/origin/integration-release)
    const matched = args.match(RECommit);
    if (!matched) {
      this.error = new Error(`Commit not parsable:${args}`);
      return;
    }
    this.sha = matched[1];
    if (matched[3]) {
      this._tags = Tag.parse(matched[3], tid, bus);
    } else {
      this._tags = [];
    }
  }

  public assignCommit(commit: GitCommit): void {
    commit.commit = this;
  }

  public isOk(): boolean {
    return !this.error && !this._tags.find(i => !i.isOk);
  }

  public next(nx: LineMatcher): LineMatcher {
    return nx;
  }

  public tagMatch(r: RegExp): boolean {
    return this.isOk() && (r.test(this.sha) || !!this._tags.find(t => r.test(t.branch)));
  }

  public tags(t: TagFlag): Tag[] {
    return this._tags.filter(i => (t == TagFlag.ALL || i.flag == t));
  }

  public toObj(): CommitObj {
    return {
      error: this.error,
      sha: this.sha,
      tags: this.tags(TagFlag.ALL)
    };
  }
}
