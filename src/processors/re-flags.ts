
export class ReFlag {
  public readonly regExp: RegExp;
  public readonly flag: string;

  public static create(matches: string[], inFlags: string[]): ReFlag[] {
    const flags = (new Array(matches.length))
      .fill('i')
      .map((f, i) => inFlags[i] || f);
    return matches.map((sm, i) => new ReFlag(new RegExp(sm, flags[i]), flags[i]));
  }

  constructor(regExp: RegExp, flag: string) {
    this.regExp = regExp;
    this.flag = flag;
  }
}
