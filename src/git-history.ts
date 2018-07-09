
import * as uuid from 'uuid';

import { GitCommitParser } from './git-commit-parser';
import { GitHistoryMsg } from './msg/git-history-msg';
import { FeedChunk } from './msg/feed-chunk';
import { LineDone } from './msg/line-done';
import { LineLine } from './msg/line-line';
import { AsLineStream } from './as-line-stream';
import { GitCommitDone } from './msg/git-commit-done';
import { GitHistoryDone } from './msg/git-history-done';
import { GitHistoryStart } from './msg/git-history-start';
import { GitHistoryError } from './msg/git-history-error';
import { FeedChunkDone } from './msg/feed-chunk-done';
import { MsgBus } from './msg-bus';
import { CliConfig } from './msg/cli-config';

export class GitHistory {
  public readonly tid: string;
  // private readonly commits: GitCommit[] = [];
  private readonly commitParser: GitCommitParser;
  private readonly asLineStream: AsLineStream;

  private readonly bus: MsgBus;

  public static start(bus: MsgBus): void {
    bus.bus.subscribe(msg => {
      CliConfig.is(msg).match(cliConfig => {
        const gh = new GitHistory(bus, cliConfig.tid);
        bus.bus.next(new GitHistoryStart(cliConfig.tid, gh));
      });
    });
  }

  constructor(bus: MsgBus, tid: string) {
    this.bus = bus;
    this.tid = tid;
    this.commitParser = new GitCommitParser(tid, this.bus);
    this.asLineStream = new AsLineStream(tid, this.bus);

    this.bus.subscribe(msg => {
      GitCommitDone.is(msg).hasTid(tid).match(gch => {
        // console.log(`ouS.next=>GitCommitDone->next:GitHistoryDone`);
        this.bus.bus.next(new GitHistoryDone(tid));
      });
      // GitCommit.is(msg).hasTid(tid).match(commit => {
      //   this.commits.push(commit);
      // });
      LineLine.is(msg).hasTid(tid).match(feedLine => {
        this.commitParser.next(feedLine);
      });
      LineDone.is(msg).hasTid(tid).match(feedDone => {
        // console.log(`ouS.next=>FeedDone`);
        this.commitParser.next(feedDone);
      });
      // console.log('ins:', msg);
      FeedChunk.is(msg).hasTid(tid).match(feed => {
        this.asLineStream.write(feed.data);
      });
      FeedChunkDone.is(msg).hasTid(tid).match(done => {
        // console.log(`ins.FeedDone.done`);
        this.asLineStream.done(); // close
      });
      GitHistoryStart.is(msg).hasTid(tid).match(m => {
        this.bus.bus.next(msg);
      });
      // CliOutputMsg.is(msg).hasTid(tid).match(m => {
      //   this.ouS.next(msg);
      // });
      GitCommitDone.is(msg).hasTid(tid).match(m => {
        this.bus.bus.next(msg);
      });
      // GroupMsgDone.is(msg).hasTid(tid).match(m => {
      //   console.log(`GitHistory:ouS`);
      //   this.ouS.next(msg);
      // });

    });
  }

  // public next(msg: GitHistoryMsg): void {
  //   // console.log('gitHistory:next', msg);
  //   this.bus.inS.next(msg);
  // }

  // public subscribe(cb: (msg: GitHistoryMsg) => void): void {
  //   this.bus.ouS.subscribe(cb);
  // }

  // public startMsg(argv: string[]): GitHistoryStart {
  //   console.log(`create:GitHistoryStart`);
  //   return new GitHistoryStart(this.tid, argv);
  // }

  // public doneMsg(): GitHistoryDone {
  //   console.log(`create:GitHistoryDone`);
  //   return new GitHistoryDone(this.tid);
  // }

  public errorMsg(err: Error): GitHistoryError {
    // console.log(`errorMsg`);
    return new GitHistoryError(this.tid, err);
  }

}

export default GitHistory;
