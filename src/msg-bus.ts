import * as Rx from 'rxjs';
import { GitHistoryMsg } from './msg/git-history-msg';

export class MsgBus  {

  // public readonly inS: Rx.Subject<GitHistoryMsg> = new Rx.Subject();
  public readonly bus: Rx.Subject<GitHistoryMsg> = new Rx.Subject();

  public next(t: GitHistoryMsg): void {
    this.bus.next(t);
  }

  public subscribe(cb: (msg: GitHistoryMsg) => void): void {
    this.bus.subscribe(cb);
  }

}
