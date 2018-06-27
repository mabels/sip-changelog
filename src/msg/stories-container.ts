import { Match } from './match';
import { GitCommit } from './git-commit';
import { CliOutputMsg } from './cli-output-msg';
import { ReFlagMatch } from '../cli/re-flag-match';
import { SipConfigInit } from './sip-config';

export class StoriesContainer extends CliOutputMsg {

  public readonly config: SipConfigInit;
  public readonly stories: Map<string, GitCommit[]> = new Map<string, GitCommit[]>();

  public static is(msg: any): Match<StoriesContainer> {
    if (msg instanceof StoriesContainer) {
      return Match.create<StoriesContainer>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, sci: SipConfigInit) {
    super(tid);
    this.config = sci;
  }

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    this.stories.forEach((commits, name) => {
      if (name.trim().length) {
        sout.write(`\t${name}\n`);
      }
      if (this.config.commitExcerpt) {
        commits.forEach(gc => {
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
        commits = [];
        this.stories.set(key, commits);
      }
      commits.push(gc);
    });
  }

}
