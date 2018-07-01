import { GitCommit } from '../msg/git-commit';
import { TagFlag } from '../header-lines/tag';
import { GroupMsg } from '../msg/group-msg';

import { ReFlagMatch } from './re-flag-match';
import { SipConfigInit } from '../msg/sip-config';

export class ChangeLog {
  public readonly grouped: GroupMsg[];
  public readonly groupBy: Map<string, GroupMsg> = new Map<string, GroupMsg>();
  public readonly storyMatches: RegExp[];
  public readonly storyMatchRegexFlags: string[];
  public readonly groupByTags: RegExp[];
  public readonly groupByTagRegexFlags: string[];
  public readonly start: RegExp;
  public readonly config: SipConfigInit;

  private currentGroup: GroupMsg;
  private foundStart: boolean;

  constructor(tid: string, cli: SipConfigInit) {
    this.storyMatchRegexFlags = (new Array(cli.storyMatches.length))
      .fill('i').map((f, i) => cli.storyMatchRegexFlags[i] || f);
    this.storyMatches = cli.storyMatches.map((sm, i) => new RegExp(sm, this.storyMatchRegexFlags[i]));

    this.groupByTagRegexFlags = (new Array(cli.groupByTags.length))
      .fill('i').map((f, i) => cli.groupByTagRegexFlags[i] || f);
    // console.log(this);
    this.groupByTags = cli.groupByTags.map((sm, i) => new RegExp(sm, this.groupByTagRegexFlags[i]));

    this.start = new RegExp(cli.start || 'will@never@ever@matched');
    this.foundStart = false;

    this.config = cli;
    this.currentGroup = new GroupMsg(tid, '', this.config);
    this.groupBy.set(this.currentGroup.name, this.currentGroup);
  }

  public add(tid: string, gc: GitCommit): void {
    if (this.foundStart) {
      return;
    }
    const gitMsg = gc.message.text();
    if (!gc.commit) {
      return;
    }
    gc.commit.tags.filter(i => i.flag == TagFlag.TAG).forEach(tag => {
      let createdGroupMsg: GroupMsg;
      this.groupByTags.find(reGt => {
        const match = tag.branch.match(reGt);
        if (match) {
          let gmsg = this.groupBy.get(match[0]);
          if (!gmsg) {
            if (!createdGroupMsg) {
              createdGroupMsg = gc.groupMsg(match[0], this.config);
              this.groupBy.set(match[0], createdGroupMsg);
            }
            gmsg = createdGroupMsg;
          }
          this.currentGroup = gmsg;
          return true;
        }
        return false;
      });
    });
    const storyMatches = this.storyMatches.map((sm, i) => new ReFlagMatch(
      gitMsg.match(sm),
      this.storyMatchRegexFlags[i])).filter(i => i.match);
    this.currentGroup.stories.add(gc, storyMatches);
    this.foundStart = gc.commit.tagMatch(this.start);
  }

  public forEach(cb: ((gm: GroupMsg) => void)): void {
    for (let gm of this.groupBy.values()) {
      cb(gm);
    }
  }
}
