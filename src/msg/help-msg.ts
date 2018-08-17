import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';

export class HelpMsg extends GitHistoryMsg {

  public readonly lines: string[];

  public static is(msg: any): Match<HelpMsg> {
    if (msg instanceof HelpMsg) {
      return Match.create<HelpMsg>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    throw new Error('Method not implemented.');
  }
}
