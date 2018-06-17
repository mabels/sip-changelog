import { MetaLine, MetaLineFactory } from './meta-line';
import { GitCommit } from './msg/git-commit';
import { Tag } from './tag';

const RECommit = /^(\S+)(\s+\((.*)\))*$/;
export class Commit implements MetaLine {

  public static readonly factory: MetaLineFactory = {
    match: (m: string): boolean => 'commit' == m,
    create: (args: string) => new Commit(args)
  };

  public readonly error?: Error;
  public readonly sha: string;
  public readonly tags: Tag[];

  constructor(args: string) {
    // tslint:disable-next-line:max-line-length
    // commit 53ab23fcf1c5d0bcca04a6f287cf2d70bb1bb4f7 (HEAD -> refs/heads/rb-release_2.0, refs/remotes/origin/rb-release_2.0, refs/remotes/origin/integration-release)
    const matched = args.match(RECommit);
    if (!matched) {
        this.error = new Error(`Commit not parsable:${args}`);
        return;
    }
    if (matched.length == 3) {
      // timezone
    }
    this.sha = matched[1];
    this.tags = Tag.parse(matched[2]);
  }

  public assignCommit(commit: GitCommit): void {
    commit.commit = this;
  }

  public isOk(): boolean {
    return !this.error;
  }
}
