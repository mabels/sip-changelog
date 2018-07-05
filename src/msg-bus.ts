import * as Rx from 'rxjs';
import { GitHistoryMsg } from './msg/git-history-msg';

export class MsgBus {

  public readonly inS: Rx.Subject<GitHistoryMsg> = new Rx.Subject();
  public readonly ouS: Rx.Subject<GitHistoryMsg> = new Rx.Subject();

}
