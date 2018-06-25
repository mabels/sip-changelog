import { Match } from './match';
import { StoryMsg } from './story-msg';
import { CliOutputMsg } from './cli-output-msg';

export class GroupMsg extends CliOutputMsg {

  public readonly name: string;
  public readonly stories: StoryMsg[];

  public static is(msg: any): Match<GroupMsg> {
    if (msg instanceof GroupMsg) {
      return Match.create<GroupMsg>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    sout.write(`${this.name}\n`);
    this.stories.forEach(story => story.output(sout, serr));
  }
}
