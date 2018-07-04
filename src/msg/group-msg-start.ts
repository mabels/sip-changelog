import { Match } from './match';
import { CliOutputMsg } from './cli-output-msg';
import { GroupMsg } from './group-msg';

export class GroupMsgStart extends CliOutputMsg {

  public readonly groupMsg: GroupMsg;

  public static is(msg: any): Match<GroupMsgStart> {
    if (msg instanceof GroupMsgStart) {
      return Match.create<GroupMsgStart>(msg);
    }
    return Match.nothing();
  }

  public constructor(gm: GroupMsg) {
    super(gm.tid);
    this.groupMsg = gm;
  }

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    sout.write(`GroupMsgStart:output\n`);
  }

}
