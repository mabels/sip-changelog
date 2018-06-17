import { MetaLine, MetaLineFactory } from '../meta-line';
import { GitCommit } from '../msg/git-commit';
import { Commit } from '../meta-lines/commit';

export class GpgSig implements MetaLine {

  public static readonly factory: MetaLineFactory = {
    match: (m: string): boolean => 'gpgsig' == m,
    create: (args: string) => new GpgSig(args)
  };

  public error?: Error;
  public readonly mimeBegin: string;
  public readonly mimeEnd: string;

  constructor(args: string) {
    this.mimeBegin = args.trim();
    this.mimeEnd = this.mimeBegin.replace('BEGIN', 'END');
  }

  public assignCommit(commit: GitCommit): void {
    commit.gpgsig = this;
  }

  public isOk(): boolean {
    return true;
  }

}
