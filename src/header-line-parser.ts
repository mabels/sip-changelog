import { DefaultHeaderLine } from './header-lines/default-header-line';
import { Author } from './header-lines/author';
import { Commit } from './header-lines/commit';
import { Committer } from './header-lines/committer';
import { Parent } from './header-lines/parent';
import { Tree } from './header-lines/tree';
import { GitCommit } from './msg/git-commit';
import { LineMatcher } from './line-matcher';
import { GpgSig } from './header-lines/gpg-sig';

import { HeaderLine, HeaderVerbArgs } from './header-lines/header-line';
import { MsgBus } from './msg-bus';

function headerLineParser(hvv: HeaderVerbArgs, tid: string, bus: MsgBus): HeaderLine {
  return [
    Author.factory,
    Commit.factory,
    Committer.factory,
    Parent.factory,
    Tree.factory,
    GpgSig.factory,
    DefaultHeaderLine.factory
  ].find(x => x.match(hvv.verb)).create(hvv.args, tid, bus);
}

const REHeaderLine = /^(\S+)\s+(.*)$/;
export function matchHeaderLine(next: LineMatcher, commit: GitCommit, line: string,
  tid: string, bus: MsgBus): LineMatcher {
  const matched = line.match(REHeaderLine);
  if (matched) {
    const headerLine = headerLineParser(new HeaderVerbArgs(matched), tid, bus);
    if (headerLine.isOk()) {
      headerLine.assignCommit(commit);
      return headerLine.next(next);
    }
    return next;
  }
  return null;
}
