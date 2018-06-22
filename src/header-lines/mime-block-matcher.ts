import { LineMatcher } from '../line-matcher';

const enum MimeStates {
  WAITEND,
  END
}

export class MimeBlockMatcher implements LineMatcher {
  public readonly begin: string;
  public readonly end: string;
  public readonly block: string[];
  private mimeState: MimeStates;
  public prevLineMatcher?: LineMatcher;
  private completeHandlers: (() => void)[] = [];

  public constructor(args: string) {
    this.begin = args.trim();
    this.end = this.begin.replace('BEGIN', 'END');
    this.block = [this.begin];
    this.mimeState = MimeStates.WAITEND;
  }

  public onComplete(cb: () => void): void {
    this.completeHandlers.push(cb);
  }

  public match(line: string): LineMatcher {
    const trimmed = line.trim();
    this.block.push(trimmed);
    if (trimmed === this.end) {
      this.completeHandlers.forEach(cb => cb());
      this.mimeState = MimeStates.END;
      return this.prevLineMatcher;
    }
    return this;
  }

  public next(nx: LineMatcher): LineMatcher {
    if (this.mimeState == MimeStates.END) {
      return nx;
    }
    if (!this.prevLineMatcher) {
      this.prevLineMatcher = nx;
    }
    return this;
  }

  public done(): void {
    throw new Error('should not called');
  }

}
