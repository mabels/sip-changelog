import { Match } from './match';
import { CliOutputMsg } from './cli-output-msg';
import { GroupMsg } from './group-msg';

export class GroupMsgAddCommit extends CliOutputMsg {

  public readonly groupMsg: GroupMsg;

  public static is(msg: any): Match<GroupMsgAddCommit> {
    if (msg instanceof GroupMsgAddCommit) {
      return Match.create<GroupMsgAddCommit>(msg);
    }
    return Match.nothing();
  }

  public constructor(gh: GroupMsg) {
    super(gh.tid);
    this.groupMsg = gh;
  }

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    sout.write(`output:GroupMsgAddCommit:${this.tid}\n`);
  }

}
