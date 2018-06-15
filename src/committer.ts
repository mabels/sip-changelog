import { MetaLine, MataLineFactory } from './meta-line';
import { GitCommit } from './msg/git-commit';

export class Committer implements MetaLine {
  public static readonly factory: MetaLineFactory = {
    name: 'commit',
    create: (args: string) => new Committer(args)
  };

  constructor(args: string) {
    //committer Blumen Gärtner <blumen.gaertner@sip.changelog.com> 1528122332 +0200
  }

  public assignCommit(commit: GitCommit): void {
    commit.committer = this;
  }
}
