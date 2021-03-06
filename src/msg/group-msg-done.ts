import { Match } from './match';
import { GroupMsg } from './group-msg';
import { GitHistoryMsg } from './git-history-msg';

export class GroupMsgDone extends GitHistoryMsg {

  public readonly groupMsg: GroupMsg;

  public static is(msg: any): Match<GroupMsgDone> {
    if (msg instanceof GroupMsgDone) {
      return Match.create<GroupMsgDone>(msg);
    }
    return Match.nothing();
  }

  public constructor(gh: GroupMsg) {
    super(gh.tid);
    this.groupMsg = gh;
  }

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    sout.write(`output:GroupMsgDone:${this.tid}\n`);
  }

}
