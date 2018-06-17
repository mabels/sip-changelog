import * as Rx from 'rxjs';
import { GitCommit } from './msg/git-commit';
import { GitCommitUnknownMeta } from './msg/git-commit-unknown-meta';
import { GitHistoryMsg } from './msg/git-history-msg';
import { FeedLine } from './msg/feed-line';
import { MetaLineParser } from './meta-line-parser';

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
        if (matchMetaLine && matchMetaLine.length == 3) {
            const metaLine = MetaLineParser(matchMetaLine[1], matchMetaLine[2]);
            if (metaLine.isOk()) {
                metaLine.assignCommit(this.getCommit(line));
            } else {
                console.log(line, metaLine.error);
                this.out.next(new GitCommitUnknownMeta(line, metaLine.error));
            }
        } else {
            console.log(matchMetaLine, line.line);
        }
    }
}
