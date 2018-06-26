import { Match } from './match';
import { GitCommit } from './git-commit';
import { CliOutputMsg } from './cli-output-msg';

export class StoriesContainer extends CliOutputMsg {

  public readonly noStorySortNumeric: boolean;
  public readonly stories: Map<string, GitCommit[]> = new Map<string, GitCommit[]>();

  public static is(msg: any): Match<StoriesContainer> {
    if (msg instanceof StoriesContainer) {
      return Match.create<StoriesContainer>(msg);
    }
    return Match.nothing();
  }

  public constructor(tid: string, noStorySortNumeric: boolean) {
    super(tid);
    this.noStorySortNumeric = noStorySortNumeric;
  }

  public output(sout: NodeJS.WritableStream, serr: NodeJS.WritableStream): void {
    this.stories.forEach((commits, name) => {
      sout.write(`\t${name}\n`);
      commits.forEach(gc => {
        sout.write(`\t\t${gc.message.excerpt()}\n`);
      });
    });
  }

  public add(gc: GitCommit, storyMatches: RegExpMatchArray[]): void {
    storyMatches.forEach(sm => {
      let commits = this.stories.get(sm[0]);
      if (!commits) {
        commits = [];
        this.stories.set(sm[0], commits);
      }
      commits.push(gc);
    });
  }

}
