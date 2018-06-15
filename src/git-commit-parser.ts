import * as Rx from 'rxjs';
import { GitCommit } from './msg/git-commit';
import { GitCommitUnknownMeta } from './msg/git-commit-unknown-meta';
import { GitHistoryMsg } from './msg/git-history-msg';
import { FeedLine } from './msg/feed-line';
import { MetaLineFactory } from './meta-line-factory';

const REMetaLine = /^(\S+)\s(.*)$/;

export class GitCommitParser {
    private readonly out: Rx.Subject<GitHistoryMsg>;

    private _commit?: GitCommit;

    constructor(out: Rx.Subject<GitHistoryMsg>) {
        this.out = out;
    }

    public getCommit(msg: GitHistoryMsg): GitCommit {
        // nameing funny of course there is a side effect
        if (!this._commit) {
            this._commit = new GitCommit(msg.tid);
        }
        return this._commit;
    }

    public next(line: FeedLine): void {
        const matchMetaLine = line.line.match(REMetaLine);
        if (matchMetaLine && matchMetaLine.length == 2) {
            const metaLine = MetaLineFactory(matchMetaLine[1], matchMetaLine[2]);
            if (metaLine) {
                metaLine.assignCommit(this.getCommit(line));
                return;
            } else {
                this.out.next(new GitCommitUnknownMeta(line));
            }
        }
    }
}
