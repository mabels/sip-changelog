import { GitCommit } from './msg/git-commit';

export interface MetaLine {
  assignCommit(commit: GitCommit): void;
}

export interface MetaLineFactory {
  name: string;
  create(args: string): MetaLine;
}
