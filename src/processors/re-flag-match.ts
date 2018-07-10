export interface ReFlagMatchInit {
  readonly match: RegExpMatchArray;
  readonly flags: string;
}

export class ReFlagMatch implements ReFlagMatchInit {
  public readonly match: RegExpMatchArray;
  public readonly flags: string;

  constructor(init: ReFlagMatchInit) {
    this.match = init.match;
    this.flags = init.flags;
  }

  public prepareKey(toPrepareKey: string): string {
    // console.log(`prepareKey:`, toPrepareKey);
    const key = toPrepareKey.trim();
    if (this.flags.includes('i')) {
      return key.toUpperCase();
    }
    return key;
  }

  public key(): string {
    return this.prepareKey(this.match[0] || '');
  }

  public sortKey(): string {
    if (this.match.length > 1 && this.match[1]) {
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
