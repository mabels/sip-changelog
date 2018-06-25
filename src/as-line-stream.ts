import { Readable, Writable } from 'stream';

import * as readline from 'readline';
import * as Rx from 'rxjs';

import { GitHistoryMsg } from './msg/git-history-msg';
import { GitHistoryError } from './msg/git-history-error';
import { FeedDone } from './msg/feed-done';
import { FeedLine } from './msg/feed-line';

class NullWriteable extends Writable {
  constructor(opts = {}) {
    super(opts);
  }
  public _write(_: {}, __: {}, cb: any): void {
    setTimeout(cb, 0);
  }
}

class StringReadable extends Readable {
  public _read(size: number): void {
    // console.error('StringReadable:', size);
  }
}

export class AsLineStream {
  public readonly input: Readable = new StringReadable();
  public readonly rl: readline.ReadLine = readline.createInterface({
    input: this.input,
    output: new NullWriteable()
  });
  public writeLen: number;

  constructor(tid: string, out: Rx.Subject<GitHistoryMsg>) {
    this.writeLen = 0;
    this.input.on('error', err => {
      out.next(new GitHistoryError(tid, err));
    });
    this.rl.on('line', line => {
      out.next(new FeedLine(tid, line));
    }).on('close', () => {
      out.next(new FeedDone(tid));
    }).on('error', err => {
      out.next(new GitHistoryError(tid, err));
    });
  }

  public done(): void {
    this.input.push(null);
  }

  public write(data: string): void {
    this.writeLen += data.length;
    this.input.push(data, 'utf-8');
  }
}
