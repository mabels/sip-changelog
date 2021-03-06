import { Match } from './match';
import { StoriesContainer } from './stories-container';
import { CliConfig } from './cli-config';
import { GroupMsgDone } from './group-msg-done';
import { GroupMsgStart } from './group-msg-start';
import { GitHistoryMsg } from './git-history-msg';

export class GroupMsg extends GitHistoryMsg {

  public readonly names: string[];
  public readonly stories: StoriesContainer;
  public readonly config: CliConfig;

  public static is(msg: any): Match<GroupMsg> {
    if (msg instanceof GroupMsg) {
      return Match.create<GroupMsg>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, names: string[], sci: CliConfig) {
    super(tid);
    this.names = names;
    this.stories = new StoriesContainer(tid, sci);
    this.config = sci;
  }

  public toJson(): { } {
    return {
      names: this.names,
      stories: this.stories.toJson()
    };
  }

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    if (this.names.length) {
      sout.write(`${this.names.join(',')}\n`);
    }
    this.stories.output(sout, serr);
  }

  public addName(name: string): string[] {
    const uniq = new Set(this.names.concat(name));
    this.names.splice(0).push.apply(this.names, uniq.keys);
    return this.names;
  }

  public msgStart(): GroupMsgStart {
    const ret = new GroupMsgStart(this);
    // console.log(`index.ts:create:GroupMsgStart`);
    return ret;
  }

  public msgDone(): GroupMsgDone {
    const ret = new GroupMsgDone(this);
    // console.log(`index.ts:create:groupMsgDone`);
    return ret;
  }

}
