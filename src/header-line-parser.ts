import { HeaderLine, HeaderVerbArgs, HeaderLineFactory } from './header-lines/header-line';
import { Author } from './header-lines/author';
import { Commit } from './header-lines/commit';
import { Committer } from './header-lines/committer';
import { Parent } from './header-lines/parent';
import { Tree } from './header-lines/tree';
import { GitCommit } from './msg/git-commit';
import { LineMatcher } from './line-matcher';
import { GpgSig } from './header-lines/gpg-sig';

class DefautHeaderLine implements HeaderLine {

  public readonly error?: Error;

  constructor(errStr: string) {
    this.error = new Error(errStr);
  }

  public isOk(): boolean {
    return false;
  }

  public assignCommit(commit: GitCommit): void {
    throw new Error('not implemented');
  }

  public next(nx: LineMatcher): LineMatcher {
    return nx;
  }

}

class DefaultFactory implements HeaderLineFactory {
  public readonly name: string = 'default';

  public match(n: string): boolean {
    return true;
  }
  public create(a: string): HeaderLine {
    return new DefautHeaderLine(a);
  }
}

const metaLineFactory = [
  Author.factory,
  Commit.factory,
  Committer.factory,
  Parent.factory,
  Tree.factory,
  GpgSig.factory,
  new DefaultFactory(),
];

export function headerLineParser(hvv: HeaderVerbArgs): HeaderLine {
  return metaLineFactory.find(x => x.match(hvv.verb)).create(hvv.args);
}

const REHeaderLine = /^(\S+)\s+(.*)$/;
export function matchHeaderLine(next: LineMatcher, commit: GitCommit, line: string): LineMatcher {
    const matched = line.match(REHeaderLine);
    if (matched) {
      const headerLine = headerLineParser(new HeaderVerbArgs(matched));
      if (headerLine.isOk()) {
        headerLine.assignCommit(commit);
        return headerLine.next(next);
      }
      return next;
    }
    return null;
}
