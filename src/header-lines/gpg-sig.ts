import { HeaderLine, HeaderLineFactory } from './header-line';
import { GitCommit } from '../msg/git-commit';
import { LineMatcher } from '../processors/line-matcher';
import { MimeBlockMatcher } from './mime-block-matcher';

export class GpgSig implements HeaderLine {

  public static readonly factory: HeaderLineFactory = {
    match: (m: string): boolean => 'gpgsig' == m,
    create: (args: string) => new GpgSig(args)
  };

  public error?: Error;
  private mimeBlockMatcher: MimeBlockMatcher;

  constructor(args: string) {
    this.mimeBlockMatcher = new MimeBlockMatcher(args);
  }

  public toJson(): string {
    return this.signatur();
  }

  public assignCommit(commit: GitCommit): void {
    this.mimeBlockMatcher.onComplete(() => {
      commit.gpgsig = this;
    });
  }

  public isOk(): boolean {
    return true;
  }

  public next(nx: LineMatcher): LineMatcher {
    return this.mimeBlockMatcher.next(nx);
  }

  public signatur(): string {
    return this.mimeBlockMatcher.block.join('\n');
  }

}
