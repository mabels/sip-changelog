import * as uuid from 'uuid';

export abstract class GitHistoryMsg {
  public readonly tid: string;
  public constructor(tid: string = uuid.v4()) {
    this.tid = tid;
  }
}
