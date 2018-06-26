import { Match } from './match';
import { StoriesContainer, StoriesContainerInit } from './stories-container';
import { CliOutputMsg } from './cli-output-msg';

export class GroupMsg extends CliOutputMsg {

  public readonly name: string;
  public readonly stories: StoriesContainer;

  public static is(msg: any): Match<GroupMsg> {
    if (msg instanceof GroupMsg) {
      return Match.create<GroupMsg>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, name: string, sci: StoriesContainerInit) {
    super(tid);
    this.name = name;
    this.stories = new StoriesContainer(tid, sci);
  }

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    sout.write(`${this.name}\n`);
    this.stories.output(sout, serr);
  }

}
