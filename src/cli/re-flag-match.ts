export class ReFlagMatch {
  public readonly match: RegExpMatchArray;
  public readonly flags: string;

  constructor(match: RegExpMatchArray, flags: string) {
    this.match = match;
    this.flags = flags;
  }

  public prepareKey(toPrepareKey: string): string {
    const key = toPrepareKey.trim();
    if (this.flags.includes('i')) {
      return key.toUpperCase();
    }
    return key;
  }

  public key(): string {
    return this.prepareKey(this.match[0]);
  }

  public sortKey(): string {
    if (this.match.length > 1) {
      return this.prepareKey(this.match[1]);
    }
    return this.key();
  }

  public sortKeyNumber(): { num: number } | undefined {
    const sortKey = this.sortKey();
    const numMatch = sortKey.match(/\d+/);
    if (numMatch) {
      return { num: ~~numMatch[0] };
    }
    return undefined;
  }
}
