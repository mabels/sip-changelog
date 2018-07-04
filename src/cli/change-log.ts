import { GitCommit } from '../msg/git-commit';
import { TagFlag } from '../header-lines/tag';
import { GroupMsg } from '../msg/group-msg';

import { ReFlagMatch } from './re-flag-match';
import { SipConfigInit } from '../msg/sip-config';

export class ChangeLog {
  public readonly groups: GroupMsg[] = [];

  public readonly storyMatches: RegExp[];
  public readonly storyMatchRegexFlags: string[];
  public readonly groupByTags: RegExp[];
  public readonly groupByTagRegexFlags: string[];
  public readonly start: RegExp;
  public readonly config: SipConfigInit;

  // private currentGroupMsg?: GroupMsg;
  private foundStart: boolean;
  private readonly _onNewGroupMsgs: ((gmsg: GroupMsg) => void)[] = [];

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
  }

  public onNewGroupMsg(cb: (gmsg: GroupMsg) => void): void {
    this._onNewGroupMsgs.push(cb);
  }

  public fireNewGroupMsgs(gmsg: GroupMsg): void {
    this._onNewGroupMsgs.forEach(cb => cb(gmsg));
  }

  private getCurrentGroupMsg(): GroupMsg {
    const ret = this.groups[this.groups.length - 1];
    // console.log(`getCurrentGroupMsg:${this.groups.length}:${JSON.stringify(ret)}`);
    return ret;
  }

  private addGroupMsg(gc: GitCommit, matchedTags: string[]): GroupMsg {
    // console.log(`addGroupMsg:${JSON.stringify(matchedTags)},${this.groups.length}`);
    const ret = gc.groupMsg(matchedTags, this.config);
    this.groups.push(ret);
    this.fireNewGroupMsgs(ret);
    return ret;
  }

  public add(gc: GitCommit): void {
    if (this.foundStart) {
      return;
    }
    if (!gc.commit) {
      return;
    }
    const commitTags = gc.commit.tags(TagFlag.TAG);
    if (commitTags.length == 0 && !this.getCurrentGroupMsg()) {
      // console.log(`empty`);
      this.addGroupMsg(gc, []);
    } else if (commitTags.length) {
      // console.log(commitTags);
      const matchedTags = Array.from(new Set(
          commitTags.map(tag => {
            const ret = this.groupByTags.map(reGt => tag.branch.match(reGt))
            .filter(m => m);
            // console.log(commitTags, ret);
            return ret;
          })
          .reduce((flat, toFlatten) => flat.concat(toFlatten), [])
          .map(m => m[0]))).sort();
      if ((matchedTags.length == 0 && !this.getCurrentGroupMsg()) || matchedTags.length > 0) {
        this.addGroupMsg(gc, matchedTags);
      }
    }
    const gitMsg = gc.message.text();
    const storyMatches = this.storyMatches.map((sm, i) => new ReFlagMatch({
      match: gitMsg.match(sm),
      flags: this.storyMatchRegexFlags[i]
    })).filter(i => i.match);
    this.getCurrentGroupMsg().stories.add(gc, storyMatches);
    this.foundStart = gc.commit.tagMatch(this.start);
  }

  public forEach(cb: ((gm: GroupMsg) => void)): void {
    this.groups.forEach(cb);
  }

  public currentGroupMsg(): GroupMsg {
    return this.groups[this.groups.length - 1];
  }

}
