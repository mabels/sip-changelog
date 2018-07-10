import { GitCommit } from '../msg/git-commit';
import { GitHistoryMsg } from '../msg/git-history-msg';
import { LineLine } from '../msg/line-line';
import { matchHeaderLine } from './header-line-parser';
import { LineMatcher } from './line-matcher';
import { LineDone } from '../msg/line-done';
import { MsgBus } from '../msg-bus';
import { GitCommitOpen } from '../msg/git-commit-open';
import { GitCommitDone } from '../msg/git-commit-done';

function done(gitCommit: GitCommit, bus: MsgBus): void {
  // console.log(`done`);
  // gitCommit.onComplete(() => {
  //   // console.log(`done:onComplete`);
  //   bus.bus.next(new GitCommitDone(gitCommit.tid));
  // });
  // gitCommit.complete();
  if (gitCommit.isComplete()) {
    bus.next(gitCommit);
  }
}

class ProcessMessage implements LineMatcher {
  private readonly bus: MsgBus;
  private readonly gitCommit: GitCommit;
  private readonly processHeaderFactory: () => LineMatcher;

  public constructor(gitCommit: GitCommit, bus: MsgBus, processHeaderFactory: () => LineMatcher) {
    this.processHeaderFactory = processHeaderFactory;
    this.gitCommit = gitCommit;
    this.bus = bus;
  }

  public match(line: string): LineMatcher {
    // console.log('ProcessMessage:', line);
    if (/^\S+/.test(line)) {
      this.bus.next(this.gitCommit);
      // next commit
      // const processMessage = new ProcessHeader(this.gitCommit.tid, this.ouS);
      return this.processHeaderFactory().match(line);
    } else {
      this.gitCommit.message.push(line);
      return this;
    }
  }

  public done(): void {
    done(this.gitCommit, this.bus);
  }
}

export class ProcessHeader implements LineMatcher {
  private readonly bus: MsgBus;
  private readonly tid: string;
  private readonly gitCommit: GitCommit;
  private readonly processMessage: LineMatcher;

  public constructor(tid: string, bus: MsgBus) {
    this.tid = tid;
    this.bus = bus;
    this.gitCommit = new GitCommit(tid);
    // this.gitCommit.onComplete((gc) => {
    //   // console.log(`ProcessHeader:`, this.gitCommit);
    //   if (gc.isComplete()) {
    //     this.bus.bus.next(gc);
    //   }
    // });
    this.processMessage = new ProcessMessage(this.gitCommit, this.bus,
      () => new ProcessHeader(this.tid, this.bus));
  }

  public match(line: string): LineMatcher {
    const next = matchHeaderLine(this, this.gitCommit, line, this.tid, this.bus);
    if (next) {
      // console.log(`processHeader`, next.constructor.name, line);
      return next;
    } else {
      return this.processMessage.match(line);
    }
  }

  public done(): void {
    done(this.gitCommit, this.bus);
  }
}

// export class GitCommitParser {
//   // private readonly ouS: Rx.Subject<GitHistoryMsg>;
//   private readonly tid: string;

//   private lineMatcher: LineMatcher;

//   constructor(tid: string, bus: MsgBus) {
//     this.tid = tid;
//     // this.ouS = ouS;
//     this.lineMatcher = new ProcessHeader(tid, bus);
//   }

//   public match(line: string): void {
//     this.lineMatcher.match(line);
//   }
// }
