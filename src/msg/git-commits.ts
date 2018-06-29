import { Match } from './match';
import { CliOutputMsg } from './cli-output-msg';
import { GitCommit } from './git-commit';
import { ReFlagMatch } from '../cli/re-flag-match';

export class GitCommits extends CliOutputMsg {

  public readonly key: string;
  public readonly sortKey: string;
  public readonly sortKeyAsNumber: { num: number } | undefined;
  public readonly gitCommits: GitCommit[] = [];

  public static is(msg: any): Match<GitCommits> {
    if (msg instanceof GitCommits) {
      return Match.create<GitCommits>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, rfm: ReFlagMatch) {
    super(tid);
    this.key = rfm.key();
    this.sortKey = rfm.sortKey();
    this.sortKeyAsNumber = rfm.sortKeyNumber();
  }

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    throw new Error('Method not implemented.');
  }

  public forEach(cb: (gc: GitCommit) => void): void {
    this.gitCommits.forEach(cb);
  }

  public push(gc: GitCommit): void {
    this.gitCommits.push(gc);
  }

}
