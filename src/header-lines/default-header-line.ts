
import { HeaderLine, HeaderLineFactory } from './header-line';
import { GitCommit } from '../msg/git-commit';
import { LineMatcher } from '../processors/line-matcher';

export class DefaultHeaderLine implements HeaderLine {

  public static factory: HeaderLineFactory = {
    // name: 'default',
    match: (n: string): boolean => true,
    create: (a: string): HeaderLine => new DefaultHeaderLine(a)
  };

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
