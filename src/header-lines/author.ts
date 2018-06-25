import { HeaderLine, HeaderLineFactory } from './header-line';
import { GitCommit } from '../msg/git-commit';
import { NameEmailDate } from './name-email-date';

export class Author extends NameEmailDate implements HeaderLine {
  public static readonly factory: HeaderLineFactory = {
    match: (m: string): boolean => 'author' == m,
    create: (args: string) => new Author(args)
  };

  public assignCommit(commit: GitCommit): void {
    commit.author = this;
  }
}
