import { Match } from './match';
import { StoriesContainer } from './stories-container';
import { CliOutputMsg } from './cli-output-msg';
import { GitCommit } from './git-commit';

export class GroupMsg extends CliOutputMsg {

  public readonly name: string;
  public readonly stories: StoriesContainer;

  public static is(msg: any): Match<GroupMsg> {
    if (msg instanceof GroupMsg) {
      return Match.create<GroupMsg>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, name: string, noStorySortNumeric: boolean) {
    super(tid);
    this.name = name;
    this.stories = new StoriesContainer(tid, noStorySortNumeric);
  }

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    sout.write(`${this.name}\n`);
    this.stories.output(sout, serr);
  }

}
