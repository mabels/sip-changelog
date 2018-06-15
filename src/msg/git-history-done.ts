import * as uuid from 'uuid';
import { Match } from './match';
import { GitHistoryMsg } from './git-history-msg';

export class GitHistoryDone extends GitHistoryMsg {

  public static is(msg: any): Match<GitHistoryDone> {
    if (msg instanceof GitHistoryDone) {
      return Match.create<GitHistoryDone>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string) {
    super(tid);
  }
}
