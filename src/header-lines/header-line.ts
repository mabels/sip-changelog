import { GitCommit } from '../msg/git-commit';
import { LineMatcher } from '../line-matcher';

export interface HeaderLine {
  error?: Error;
  isOk(): boolean;
  assignCommit(commit: GitCommit): void;
  next(lineMatcher: LineMatcher): LineMatcher;
}

export class HeaderVerbArgs {
  public readonly verb: string;
  public readonly args: string;
  constructor(matched: RegExpMatchArray) {
      this.verb = matched[1];
      this.args = matched[2];
  }
}

export interface HeaderLineFactory {
  // name: string;
  match(name: string): boolean;
  create(args: string): HeaderLine;
}
