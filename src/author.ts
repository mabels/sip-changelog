import { MetaLine, MetaLineFactory } from './meta-line';
import { GitCommit } from './msg/git-commit';
import { NameEmailDate } from './name-email-date';

export class Author extends NameEmailDate implements MetaLine {
  public static readonly factory: MetaLineFactory = {
    match: (m: string): boolean => 'author' == m,
    create: (args: string) => new Author(args)
  };

  public assignCommit(commit: GitCommit): void {
    commit.author = this;
  }
}
