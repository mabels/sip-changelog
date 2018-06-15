import { MetaLine, MataLineFactory } from './meta-line';
import { GitCommit } from './msg/git-commit';

export class Commit implements MetaLine {
  public static readonly factory: MetaLineFactory = {
    name: 'commit',
    create: (args: string) => new Commit(args)
  };

  constructor(args: string) {
    // commit 53ab23fcf1c5d0bcca04a6f287cf2d70bb1bb4f7 (HEAD -> refs/heads/rb-release_2.0, refs/remotes/origin/rb-release_2.0, refs/remotes/origin/integration-release)
  }

  public assignCommit(commit: GitCommit): void {
    commit.commit = this;
  }
}
