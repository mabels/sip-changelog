import { MetaLine, MetaLineFactory } from '../meta-line';
import { GitCommit } from '../msg/git-commit';
import { NameEmailDate } from './name-email-date';

export class Committer extends NameEmailDate implements MetaLine {

  public static readonly factory: MetaLineFactory = {
    match: (m: string): boolean => 'committer' == m,
    create: (args: string) => new Committer(args)
  };

  public assignCommit(commit: GitCommit): void {
    commit.committer = this;
  }

}
