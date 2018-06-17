import { Match } from './match';
import { GitHistoryWarning } from './git-history-warning';
import { FeedLine } from './feed-line';

export class GitCommitUnknownMeta extends GitHistoryWarning {
  public readonly error: Error;

  public static is(msg: any): Match<GitCommitUnknownMeta> {
    if (msg instanceof GitCommitUnknownMeta) {
      return Match.create<GitCommitUnknownMeta>(msg);
    }
    return Match.nothing();
  }

  public constructor(line: FeedLine, error: Error) {
    super(line.tid, line.line);
    this.error = error;
  }
}
