import { HeaderLine, HeaderLineFactory } from './header-line';
import { GitCommit } from '../msg/git-commit';
import { NameEmailDate } from './name-email-date';

export class Committer extends NameEmailDate implements HeaderLine {

  public static readonly factory: HeaderLineFactory = {
    match: (m: string): boolean => 'committer' == m,
    create: (args: string) => new Committer(args)
  };

  public assignCommit(commit: GitCommit): void {
    commit.committer = this;
  }

}
