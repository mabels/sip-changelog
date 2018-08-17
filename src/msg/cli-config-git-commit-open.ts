
import { GitHistoryMsg } from './git-history-msg';
import { Match } from './match';
import { CliConfig } from './cli-config';
import { GitCommitOpen } from './git-commit-open';
// import { GitCommit } from './git-commit';

export class CliConfigGitCommitOpen extends GitHistoryMsg {
  private static byTid: Map<string, CliConfigGitCommitOpen> = new Map<string, CliConfigGitCommitOpen>();

  public cliConfig: CliConfig;
  public gitCommitOpen: GitCommitOpen;

  private static setByTid(msg: GitHistoryMsg,
    cb: (ccgco: CliConfigGitCommitOpen) => void): Match<CliConfigGitCommitOpen> {
    let ret = this.byTid.get(msg.tid);
    if (!ret) {
      ret = new CliConfigGitCommitOpen(msg.tid);
      this.byTid.set(msg.tid, ret);
    }
    cb(ret);
    if (ret.isComplete()) {
      return Match.create(ret);
    }
    return Match.nothing();
  }

  private static setByTidCliConfig(msg: CliConfig): Match<CliConfigGitCommitOpen> {
    return this.setByTid(msg, (ccgco) => ccgco.cliConfig = msg);
  }

  private static setByTidGitCommitOpen(msg: GitCommitOpen): Match<CliConfigGitCommitOpen> {
    return this.setByTid(msg, (ccgco) => ccgco.gitCommitOpen = msg);
  }

  public static is(msg: GitHistoryMsg): Match<CliConfigGitCommitOpen> {
    if (msg instanceof CliConfig) {
      return this.setByTidCliConfig(msg);
    } else if (msg instanceof GitCommitOpen) {
      return this.setByTidGitCommitOpen(msg);
    }
    return Match.nothing();
  }

  constructor(tid: string) {
    super(tid);
  }

  private isComplete(): boolean {
    return !!this.cliConfig && !!this.gitCommitOpen;
  }

}
