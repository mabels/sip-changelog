import { Match } from './match';
import { GitCommit } from './git-commit';
import { CliOutputMsg } from './cli-output-msg';

export class StoryMsg extends CliOutputMsg {

  public readonly name: string;
  public readonly commits: GitCommit[];

  public static is(msg: any): Match<StoryMsg> {
    if (msg instanceof StoryMsg) {
      return Match.create<StoryMsg>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    sout.write(`\t${this.name}\n`);
    this.commits.forEach(commit => sout.write(`\t\t${commit.message.excerpt()}\n`));
  }

}
