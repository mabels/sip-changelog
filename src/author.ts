import { MetaLine, MetaLineFactory } from './meta-line';
import { GitCommit } from './msg/git-commit';

// const REAuthor = /^(.*)\s+<([^>]+>\s+(\D+)(\s+([-+]*\D+))*$/;
export class Author implements MetaLine {
  public static readonly factory: MetaLineFactory = {
    name: 'parent',
    create: (args: string) => new Author(args)
  };

  public readonly name: string;
  public readonly email: string;
  public readonly date: Date;

  constructor(args: string) {
    //author Blumen Gärtner <blumen.gaertner@sip.changlog.com> 1528119580 +0200
    c
    this.name = 
  }
  public assignCommit(commit: GitCommit): void {
    commit.author = this;
  }
}

