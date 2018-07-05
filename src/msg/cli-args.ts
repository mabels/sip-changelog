import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';

export class CliArgs extends GitHistoryMsg {

  public readonly args: string[];

  public static is(msg: any): Match<CliArgs> {
    if (msg instanceof CliArgs) {
      return Match.create<CliArgs>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, args: string[]) {
    super(tid);
    this.args = args;
  }

}
