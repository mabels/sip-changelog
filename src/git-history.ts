import { GitCommitParser } from './git-commit-parser';
import { GitHistoryMsg } from './msg/git-history-msg';
import * as Rx from 'rxjs';
import { Feed } from './msg/feed';
import { FeedDone } from './msg/feed-done';
import * as readline from 'readline';
import { Writable, Readable } from 'stream';
import { FeedLine } from './msg/feed-line';
import { GitHistoryError } from './msg/git-history-error';
import { GitHistoryWarning } from './msg/git-history-warning';
import { GitHistoryDone } from './msg/git-history-done';
import { GitCommit } from './msg/git-commit';

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

class CommitReader {
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
      // console.log('.');
      out.next(new FeedLine(tid, line));
    }).on('close', () => {
      console.error('WHY Close');
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
    // console.log(`[${data.length},${this.writeLen}]`);
    this.input.push(data, 'utf-8');
  }
}

export class GitHistory {
  private readonly commits: GitCommit[] = [];
  private readonly commitParser: GitCommitParser;

  private readonly inS: Rx.Subject<GitHistoryMsg> = new Rx.Subject();
  private readonly ouS: Rx.Subject<GitHistoryMsg> = new Rx.Subject();

  private readonly tidBuffer: Map<string, CommitReader> = new Map();

  constructor() {
    this.commitParser = new GitCommitParser(this.ouS);
    this.ouS.subscribe(msg => {
      // console.log('feedLine', msg.constructor.name);
      GitCommit.is(msg).match(commit => {
        this.commits.push(commit);
      });
      FeedLine.is(msg).match(feedLine => {
        this.commitParser.next(feedLine);
      });
    });
    this.inS.subscribe(msg => {
      Feed.is(msg).match(feed => {
        let commitReader = this.tidBuffer.get(feed.tid);
        if (!commitReader) {
          commitReader = new CommitReader(feed.tid, this.ouS);
          this.tidBuffer.set(feed.tid, commitReader);
        }
        commitReader.write(feed.data);
      });
      FeedDone.is(msg).match(done => {
        let commitReader = this.tidBuffer.get(done.tid);
        if (!commitReader) {
          this.ouS.next(new GitHistoryWarning(done.tid, `tid[${done.tid}] not found`));
        } else {
          commitReader.done(); // close
        }
        this.tidBuffer.delete(done.tid);
        this.ouS.next(new GitHistoryDone(done.tid));
      });
    });
  }

  public next(msg: GitHistoryMsg): void {
    this.inS.next(msg);
  }

  public subscribe(cb: (msg: GitHistoryMsg) => void): void {
    this.ouS.subscribe(cb);
  }

}

export default GitHistory;
