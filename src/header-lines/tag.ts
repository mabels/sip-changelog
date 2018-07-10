import { $enum } from 'ts-enum-util';

import { GitHistoryError } from '../msg/git-history-error';
import { MsgBus } from '../msg-bus';

export enum TagFlag {
  ERR = 'error',
  NONE = 'none',
  ALL = 'all',
  HEAD = 'HEAD',
  TAG = 'tag'
}

const enumTagFlag = $enum(TagFlag);

export interface TagEntry {
  branch: string;
  flag: string;
  error?: string;
}

export class Tag {
  public readonly branch: string;
  public readonly flag: TagFlag;
  public readonly error?: string;

  public static parse(str: string, tid: string, bus: MsgBus): Tag[] {
    return str.split(',').map(s => s.trim()).map(tag => new Tag(tag, tid, bus));
  }

  private constructor(tagStr: string, tid: string, bus: MsgBus) {
    // tslint:disable-next-line:max-line-length
    // HEAD -> refs/heads/rb-release_2.0, refs/remotes/origin/rb-release_2.0, refs/remotes/origin/integration-release)
    const tagSplit = tagStr.split(/->|:/).map(s => s.trim());
    this.branch = tagSplit[tagSplit.length - 1];
    if (tagSplit.length > 1) {
      const flag = tagSplit[0];
      this.flag = enumTagFlag.asValueOrDefault(flag, TagFlag.ERR);
      if (this.flag === TagFlag.ERR) {
        // tslint:disable-next-line:max-line-length
        this.error = `unknown Tagflags:${JSON.stringify(Array.from(enumTagFlag.values()))},${JSON.stringify(tagSplit)}`;
        bus.next(new GitHistoryError(tid, new Error(this.error)));
      }
    } else {
      this.flag = TagFlag.NONE;
    }
  }

  public isOk(): boolean {
    return !this.error;
  }

  public toObj(): TagEntry {
    // console.log(`${this.flag}=>${enumTagFlag.getKeyOrThrow(this.flag)}`);
    return {
      branch: this.branch,
      flag: enumTagFlag.getKeyOrThrow(this.flag),
      error: this.error,
    };
  }
}
