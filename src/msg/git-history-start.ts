import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';
import { CliOutputMsg } from './cli-output-msg';

export class GitHistoryStart extends CliOutputMsg {
  public readonly argv: string[];

  public static is(msg: any): Match<GitHistoryStart> {
    if (msg instanceof GitHistoryStart) {
      return Match.create<GitHistoryStart>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, argv: string[]) {
    super(tid);
    this.argv = argv;
  }

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    sout.write(`GitHistoryStart:output\n`);
  }

}
