import { Readable, Writable } from 'stream';

import * as readline from 'readline';

import { GitHistoryError } from './msg/git-history-error';
import { LineDone } from './msg/line-done';
import { LineLine } from './msg/line-line';
import { MsgBus } from './msg-bus';

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

  constructor(tid: string, bus: MsgBus) {
    this.writeLen = 0;
    this.input.on('error', err => {
      bus.bus.next(new GitHistoryError(tid, err));
    });
    this.rl.on('line', line => {
      bus.bus.next(new LineLine(tid, line));
    }).on('close', () => {
      bus.bus.next(new LineDone(tid));
    }).on('error', err => {
      bus.bus.next(new GitHistoryError(tid, err));
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
