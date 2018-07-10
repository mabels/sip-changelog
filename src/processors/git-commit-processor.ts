import { GitCommit } from '../msg/git-commit';
import { MsgBus } from '../msg-bus';
import { GitCommitDone } from '../msg/git-commit-done';
import { LineMatcher } from './line-matcher';
import { LineOpen } from '../msg/line-open';
import { LineDone } from '../msg/line-done';
import { GitHistoryError } from '../msg/git-history-error';
import { GitCommitOpen } from '../msg/git-commit-open';
import { LineLine } from '../msg/line-line';
import { matchHeaderLine } from './header-line-parser';
import { ProcessHeader } from './git-commit-parser';

export class GitCommitProcessor {
  public readonly tid2LineMatcher: Map<string, LineMatcher> = new Map<string, LineMatcher>();

  constructor(msgBus: MsgBus) {
    msgBus.subscribe(msg => {
      LineOpen.is(msg).match(lineOpen => {
        const lineMatcher = new ProcessHeader(lineOpen.tid, msgBus);
        this.tid2LineMatcher.set(lineOpen.tid, lineMatcher);
        msgBus.next(new GitCommitOpen(lineOpen.tid));
      });
      LineLine.is(msg).match(lineLine => {
        const lineMatcher = this.tid2LineMatcher.get(lineLine.tid);
        if (!lineMatcher) {
          msgBus.next(new GitHistoryError(lineLine.tid, new Error(`unknown tid:${lineLine.tid}`)));
          return;
        }
        this.tid2LineMatcher.set(lineLine.tid, lineMatcher.match(lineLine.line));
      });
      LineDone.is(msg).match(lineDone => {
        const lineMatcher = this.tid2LineMatcher.get(lineDone.tid);
        if (!lineMatcher) {
          msgBus.next(new GitHistoryError(lineDone.tid, new Error(`unknown tid:${lineDone.tid}`)));
          return;
        }
        lineMatcher.done();
        msgBus.next(new GitCommitDone(lineDone.tid));
        this.tid2LineMatcher.delete(lineDone.tid);
      });
      GitHistoryError.is(msg).match(err => {
        this.tid2LineMatcher.delete(err.tid);
      });
    });
  }
}
