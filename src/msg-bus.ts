import * as Rx from 'rxjs';
import { GitHistoryMsg } from './msg/git-history-msg';
// import { Match } from './msg/match';

// export type Combining<T extends GitHistoryMsg> = {
//   [P in keyof T]: T[P]
// };

export class MsgBus  {

  // public readonly inS: Rx.Subject<GitHistoryMsg> = new Rx.Subject();
  private readonly bus: Rx.Subject<GitHistoryMsg> = new Rx.Subject();

  // public static combine<T extends GitHistoryMsg>(x: Combining<T>): Combined<T> {
  //   return new Combined(x);
  // }

  public next(t: GitHistoryMsg): void {
    this.bus.next(t);
  }

  public subscribe(cb: (msg: GitHistoryMsg) => void): Rx.Subscription {
    return this.bus.subscribe(cb);
  }

}
