import { GitCommit } from '../msg/git-commit';

export interface MetaLine {
  error?: Error;
  isOk(): boolean;
  assignCommit(commit: GitCommit): void;
}

export interface MetaLineFactory {
  // name: string;
  match(name: string): boolean;
  create(args: string): MetaLine;
}
