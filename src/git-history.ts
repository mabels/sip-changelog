
import * as Rx from 'rxjs';
import * as uuid from 'uuid';

import { GitCommitParser } from './git-commit-parser';
import { GitHistoryMsg } from './msg/git-history-msg';
import { Feed } from './msg/feed';
import { FeedDone } from './msg/feed-done';
import { FeedLine } from './msg/feed-line';
import { GitCommit } from './msg/git-commit';
import { AsLineStream } from './as-line-stream';
import { GitCommitDone } from './msg/git-commit-done';
import { GitHistoryDone } from './msg/git-history-done';
import { GitHistoryStart } from './msg/git-history-start';
import { GitHistoryError } from './msg/git-history-error';
import { CliOutputMsg } from './msg/cli-output-msg';
import { GroupMsgDone } from './msg/group-msg-done';

export class GitHistory {
  public readonly tid: string;
  private readonly commits: GitCommit[] = [];
  private readonly commitParser: GitCommitParser;
  private readonly asLineStream: AsLineStream;

  private readonly inS: Rx.Subject<GitHistoryMsg> = new Rx.Subject();
  private readonly ouS: Rx.Subject<GitHistoryMsg> = new Rx.Subject();

  constructor(tid: string = uuid.v4()) {
    this.tid = tid;
    this.commitParser = new GitCommitParser(tid, this.ouS);
    this.asLineStream = new AsLineStream(tid, this.ouS);
    this.ouS.subscribe(msg => {
      GitCommitDone.is(msg).hasTid(tid).match(gch => {
        this.ouS.next(new GitHistoryDone(tid));
      });
      GitCommit.is(msg).hasTid(tid).match(commit => {
        this.commits.push(commit);
      });
      FeedLine.is(msg).hasTid(tid).match(feedLine => {
        this.commitParser.next(feedLine);
      });
      FeedDone.is(msg).hasTid(tid).match(feedDone => {
        // console.log('FEED-DONE');
        this.commitParser.next(feedDone);
      });
    });
    this.inS.subscribe(msg => {
      // console.log('ins:', msg);
      Feed.is(msg).hasTid(tid).match(feed => {
        this.asLineStream.write(feed.data);
      });
      FeedDone.is(msg).hasTid(tid).match(done => {
        this.asLineStream.done(); // close
      });
      GitHistoryStart.is(msg).hasTid(tid).match(m => {
        this.ouS.next(msg);
      });
      CliOutputMsg.is(msg).hasTid(tid).match(m => {
        this.ouS.next(msg);
      });
    });
  }

  public next(msg: GitHistoryMsg): void {
    // console.log('gitHistory:next', msg);
    this.inS.next(msg);
  }

  public subscribe(cb: (msg: GitHistoryMsg) => void): void {
    this.ouS.subscribe(cb);
  }

  public startMsg(argv: string[]): GitHistoryStart {
    return new GitHistoryStart(this.tid, argv);
  }

  public doneMsg(): GitHistoryDone {
    return new GitHistoryDone(this.tid);
  }

  public groupMsgDone(): GroupMsgDone {
    return new GroupMsgDone(this.tid);
  }

  public errorMsg(err: Error): GitHistoryError {
    // console.log(`errorMsg`);
    return new GitHistoryError(this.tid, err);
  }

}

export default GitHistory;
