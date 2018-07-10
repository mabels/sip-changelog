import * as Rx from 'rxjs';
import { GitHistoryMsg } from './msg/git-history-msg';

export type Combining<T extends GitHistoryMsg> = { [P in keyof T]: T[P] };
// export type Combine<T extends GitHistoryMsg> = { [P in keyof T]: T[P] };

export class MsgBus  {

  // public readonly inS: Rx.Subject<GitHistoryMsg> = new Rx.Subject();
  private readonly bus: Rx.Subject<GitHistoryMsg> = new Rx.Subject();

  public static combine<T extends GitHistoryMsg>(cb: Combining<T>): Combining<T> {
    return null;
  }
  public next(t: GitHistoryMsg): void {
    this.bus.next(t);
  }

  public subscribe(cb: (msg: GitHistoryMsg) => void): void {
    this.bus.subscribe(cb);
  }

}
