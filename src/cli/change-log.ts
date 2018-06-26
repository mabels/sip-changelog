import { GitCommit } from '../msg/git-commit';
import { TagFlag } from '../header-lines/tag';
import { GroupMsg } from '../msg/group-msg';

export interface ChangeLogInit {
  storyMatches: string[];
  groupByTags: string[];
  noStorySortNumeric: boolean;
}

export class ChangeLog {
  public readonly groupBy: Map<string, GroupMsg> = new Map<string, GroupMsg>();
  public readonly storyMatches: RegExp[];
  public readonly groupByTags: RegExp[];
  public readonly noStorySortNumeric: boolean;

  constructor(cli: ChangeLogInit) {
    this.storyMatches = cli.storyMatches.map(sm => new RegExp(sm));
    this.groupByTags = cli.groupByTags.map(sm => new RegExp(sm));
    this.noStorySortNumeric = cli.noStorySortNumeric;
  }

  public add(tid: string, gc: GitCommit): void {
    const gitMsg = gc.message.text();
    // console.log('-0', gitMsg);
    const storyMatches = this.storyMatches.map(sm => gitMsg.match(sm)).filter(i => i);
    // console.log('-1');
    if (!gc.commit) {
      return;
    }
    console.log('-2', gc.commit.tags);
    gc.commit.tags.filter(i => i.flag == TagFlag.TAG).forEach(tag => {
      console.log('-3');
      this.groupByTags.forEach(reGt => {
        const match = tag.branch.match(reGt);
        if (match) {
          let gmsg = this.groupBy.get(match[0]);
          if (!gmsg) {
            gmsg = gc.groupMsg(match[0], this.noStorySortNumeric);
            this.groupBy.set(match[0], gmsg);
          }
          gmsg.stories.add(gc, storyMatches);
        }
      });
    });
    console.log('-4');
  }

  public forEach(cb: ((gm: GroupMsg) => void)): void {
    for (let gm of this.groupBy.values()) {
      cb(gm);
    }
  }
}
