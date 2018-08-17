import { Match } from './match';
import { GitCommit } from './git-commit';
import { ReFlagMatch } from '../processors/re-flag-match';
import { CliConfig } from './cli-config';
import { GitCommits } from './git-commits';
import { GitHistoryMsg } from './git-history-msg';

export class StoriesContainer extends GitHistoryMsg {

  public readonly config: CliConfig;
  public readonly stories: Map<string, GitCommits> = new Map<string, GitCommits>();

  public static is(msg: any): Match<StoriesContainer> {
    if (msg instanceof StoriesContainer) {
      return Match.create<StoriesContainer>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, sci: CliConfig) {
    super(tid);
    this.config = sci;
  }

  public toJson(): {} {
    return Array.from(this.stories.entries()).map(([sname, gcs]) => ({
      name: sname,
      commits: gcs.toJson()
    }));
  }

  public orderEq<T>(a: T, b: T): number {
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    }
    return 0;
  }

  public sort(): GitCommits[] {
    return Array.from(this.stories.values()).sort((a, b) => {
      if (this.config.config.storySortNumeric) {
        // console.log(a.sortKey, a.sortKeyAsNumber, b.sortKey, b.sortKeyAsNumber);
        if (a.sortKeyAsNumber && b.sortKeyAsNumber) {
          return this.orderEq(a.sortKeyAsNumber.num, b.sortKeyAsNumber.num);
        }
        if (!a.sortKeyAsNumber && b.sortKeyAsNumber) {
          return 1;
        }
        if (a.sortKeyAsNumber && !b.sortKeyAsNumber) {
          return -1;
        }
      }
      return this.orderEq(a.sortKey, b.sortKey);
    });
  }

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    this.sort().forEach(gcs => {
      if (gcs.key.length) {
        sout.write(`\t${gcs.key}\n`);
      }
      if (this.config.config.omitExcerpt) {
        gcs.forEach(gc => {
          sout.write(`\t\t${gc.message.excerpt()}\n`);
        });
      }
    });
  }

  public add(gc: GitCommit, storyMatches: ReFlagMatch[]): void {
    storyMatches.forEach(sm => {
      const key = sm.key();
      let commits = this.stories.get(key);
      if (!commits) {
        commits = new GitCommits(this.tid, sm);
        this.stories.set(key, commits);
      }
      commits.push(gc);
    });
  }

  // public last(): Sto

}
