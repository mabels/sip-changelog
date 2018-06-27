import { Match } from './match';
import { StoriesContainer } from './stories-container';
import { CliOutputMsg } from './cli-output-msg';
import { SipConfigInit } from './sip-config';

export class GroupMsg extends CliOutputMsg {

  public readonly name: string;
  public readonly stories: StoriesContainer;

  public static is(msg: any): Match<GroupMsg> {
    if (msg instanceof GroupMsg) {
      return Match.create<GroupMsg>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, name: string, sci: SipConfigInit) {
    super(tid);
    this.name = name;
    this.stories = new StoriesContainer(tid, sci);
  }

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    if (this.name.trim().length) {
      sout.write(`${this.name.trim()}\n`);
    }
    this.stories.output(sout, serr);
  }

}
