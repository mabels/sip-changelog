import * as uuid from 'uuid';

export abstract class GitHistoryMsg {
  public readonly id: string;
  public readonly tid: string;
  public constructor(tid: string = uuid.v4()) {
    this.tid = tid;
    this.id = uuid.v4();
  }

  public get type(): string {
    return this.constructor.name;
  }
}
