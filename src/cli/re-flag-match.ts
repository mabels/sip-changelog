export class ReFlagMatch {
  public readonly match: RegExpMatchArray;
  public readonly flag: string;

  constructor(match: RegExpMatchArray, flag: string) {
    this.match = match;
    this.flag = flag;
  }

  public key(): string {
    if (this.flag.includes('i')) {
      return this.match[0].toUpperCase();
    }
    return this.match[0];
  }
}
