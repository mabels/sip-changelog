import { LineMatcher } from '../processors/line-matcher';

const RENameEmailDate = /^(.*)\s+<(.+)>\s+(\d+)(\s+([-+]*\d+))*$/;
export abstract class NameEmailDate  {

  public readonly name: string;
  public readonly email: string;
  public readonly date: Date;
  public readonly error?: Error;

  constructor(args: string) {
    // author Blumen Gärtner <blumen.gaertner@sip.changlog.com> 1528119580 +0200
    const matched = args.match(RENameEmailDate);
    if (!matched) {
        this.error = Error(`NameEmailDate not parsable:${args}`);
        return;
    }
    if (matched.length == 5) {
      // timezone
    }
    this.name = matched[1];
    this.email = matched[2];
    this.date = new Date(parseInt(matched[3], 10) * 1000);
  }

  public toJson(): { } {
    return {
      name: this.name,
      email: this.email,
      date: this.date.toISOString(),
      error: this.error ? this.error.message : undefined,
    };
  }

  public isOk(): boolean {
      return !this.error;
  }

  public next(nx: LineMatcher): LineMatcher {
    return nx;
  }

}
