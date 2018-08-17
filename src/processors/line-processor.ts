
import { Readable, Writable } from 'stream';
import * as readline from 'readline';

import { MsgBus } from '../msg-bus';
import { GitHistoryError } from '../msg/git-history-error';
import { StreamData } from '../msg/stream-data';
import { StreamDone } from '../msg/stream-done';
import { StreamOpen } from '../msg/stream-open';
import { LineOpen } from '../msg/line-open';
import { LineDone } from '../msg/line-done';
import { LineLine } from '../msg/line-line';

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
      bus.next(new GitHistoryError(tid, err));
    });
    this.rl.on('line', line => {
      bus.next(new LineLine(tid, line));
    }).on('close', () => {
      bus.next(new LineDone(tid));
    }).on('error', err => {
      bus.next(new GitHistoryError(tid, err));
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

export class LineProcessor {

  public readonly tid2AsLineStream: Map<string, AsLineStream> = new Map<string, AsLineStream>();

  public static create(msgBus: MsgBus): LineProcessor {
    return new LineProcessor(msgBus);
  }

  private constructor(msgBus: MsgBus) {
    msgBus.subscribe(msg => {
      StreamOpen.is(msg).match(streamOpen => {
        const asLineStream = new AsLineStream(streamOpen.tid, msgBus);
        this.tid2AsLineStream.set(streamOpen.tid, asLineStream);
        msgBus.next(new LineOpen(streamOpen.tid));
      });
      StreamData.is(msg).match(streamData => {
        const asLineStream = this.tid2AsLineStream.get(streamData.tid);
        asLineStream.write(streamData.data);
      });
      StreamDone.is(msg).match(streamDone => {
        const asLineStream = this.tid2AsLineStream.get(streamDone.tid);
        asLineStream.done();
      });
      LineDone.is(msg).match(lineDone => {
        this.tid2AsLineStream.delete(lineDone.tid);
      });
      GitHistoryError.is(msg).match(err => {
        this.tid2AsLineStream.delete(err.tid);
      });
    });
  }

}
