
import { GitCommit } from '../msg/git-commit';
import { TagFlag } from '../header-lines/tag';
import { GroupMsg } from '../msg/group-msg';

import { ReFlagMatch } from './re-flag-match';
// import { SipConfig } from '../msg/sip-config';
import { MsgBus } from '../msg-bus';
import { GitCommitDone } from '../msg/git-commit-done';
// import { GitCommitOpen } from '../msg/git-commit-open';
import { GitHistoryError } from '../msg/git-history-error';
import { ChangeLogOpen } from '../msg/change-log-open';
import { CliConfig } from '../msg/cli-config';
import { ChangeLogDone } from '../msg/change-log-done';
import { CliConfigGitCommitOpen } from '../msg/cli-config-git-commit-open';
import { GroupMsgStart } from '../msg/group-msg-start';
import { GroupMsgAddCommit } from '../msg/group-msg-add-commit';
import { GroupMsgDone } from '../msg/group-msg-done';

export class ChangeLog {
  // public readonly groups: GroupMsg[] = [];

  private foundStart: boolean;
  private readonly bus: MsgBus;
  // private readonly tid: string;
  private readonly cfg: CliConfig;

  private currentGroup?: GroupMsg;

  constructor(tid: string, bus: MsgBus, cfg: CliConfig) {
    // this.tid = tid;
    this.bus = bus;
    this.cfg = cfg;
    // console.log(`ChangeLog:`, cfg);
    this.foundStart = false;
  }

  public currentGroupMsg(): GroupMsg {
    // const ret = this.groups[this.groups.length - 1];
    const ret = this.currentGroup;
    // console.log(`getCurrentGroupMsg:${this.groups.length}:${JSON.stringify(ret)}`);
    return ret;
  }

  private addGroupMsg(gc: GitCommit, matchedTags: string[]): GroupMsg {
    // console.log(`addGroupMsg:${JSON.stringify(matchedTags)},${this.groups.length}`);
    const ret = gc.groupMsg(matchedTags, this.cfg);
    // this.groups.push(ret);
    this.currentGroup = ret;
    // console.log(`addGroupMsg`, ret);
    this.bus.next(new GroupMsgStart(ret));
    return ret;
  }

  public add(gc: GitCommit): void {
    if (this.foundStart) {
      // console.log(`foundStart branch`);
      return;
    }
    if (!gc.commit) {
      // console.log(`no commit`);
      return;
    }
    const commitTags = gc.commit.tags(TagFlag.TAG);
    if (commitTags.length == 0 && !this.currentGroupMsg()) {
      // console.log(`empty`);
      this.addGroupMsg(gc, []);
    } else if (commitTags.length) {
      // console.log(commitTags);
      const matchedTags = Array.from(new Set(
          commitTags.map(tag => {
            const ret = this.cfg.groupByTags.map(reGt => tag.branch.match(reGt.regExp))
            .filter(m => m);
            // console.log(commitTags, ret);
            return ret;
          })
          .reduce((flat, toFlatten) => flat.concat(toFlatten), [])
          .map(m => m[0]))).sort();
      if ((matchedTags.length == 0 && !this.currentGroupMsg())
          || matchedTags.length > 0) {
        if (this.currentGroupMsg()) {
          this.bus.next(new GroupMsgDone(this.currentGroupMsg()));
        }
        this.addGroupMsg(gc, matchedTags);
      }
    }
    const gitMsg = gc.message.text();
    // console.log(this.cfg);
    const storyMatches = this.cfg.storyMatches.map((sm, i) => new ReFlagMatch({
      match: gitMsg.match(sm.regExp),
      flags: sm.flag
    })).filter(i => i.match);
    this.currentGroupMsg().stories.add(gc, storyMatches);
    this.bus.next(new GroupMsgAddCommit(this.currentGroupMsg()));
    this.foundStart = gc.commit.tagMatch(this.cfg.start);
  }

  public done(): void {
    if (this.currentGroupMsg()) {
      this.bus.next(new GroupMsgDone(this.currentGroupMsg()));
    }
    /* */
  }

}

export class ChangeLogProcessor {
  public readonly tid2LineMatcher: Map<string, ChangeLog> = new Map<string, ChangeLog>();

  public static create(msgBus: MsgBus): ChangeLogProcessor {
    return new ChangeLogProcessor(msgBus);
  }

  private constructor(msgBus: MsgBus) {
    msgBus.subscribe(msg => {
      // console.log(msg.type);
      CliConfigGitCommitOpen.is(msg).match(cg => {
        const changeLog = new ChangeLog(cg.tid, msgBus, cg.cliConfig);
        this.tid2LineMatcher.set(cg.tid, changeLog);
        msgBus.next(new ChangeLogOpen(cg.tid));
      });
      GitCommit.is(msg).match(gc => {
        const changeLog = this.tid2LineMatcher.get(gc.tid);
        // console.log(`GroupMsg`, gc);
        changeLog.add(gc);
        // this.tid2LineMatcher.set(gc.tid, changeLog.add(gc));
      });
      GitCommitDone.is(msg).match(lineDone => {
        const changeLog = this.tid2LineMatcher.get(lineDone.tid);
        changeLog.done();
        msgBus.next(new ChangeLogDone(lineDone.tid));
        this.tid2LineMatcher.delete(lineDone.tid);
      });
      GitHistoryError.is(msg).match(err => {
        this.tid2LineMatcher.delete(err.tid);
      });
    });
  }
}
