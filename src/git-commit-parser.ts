import * as Rx from 'rxjs';
import { GitCommit } from './msg/git-commit';
import { GitCommitUnknownMeta } from './msg/git-commit-unknown-meta';
import { GitHistoryMsg } from './msg/git-history-msg';
import { FeedLine } from './msg/feed-line';
import { HeaderLineParser } from './header-line-parser';
import { HistoryParser } from './history-parser';
import { LineMatcher, LineMatched } from './line-matcher';

const REHeaderLine = /^(\S+)\s(.*)$/;
class HeaderLineParser implements LineMatcher {
    public match(line: string): LineMatched;
}

class ProcessHeader implements HistoryParser {
    private readonly headerLineParser: LineMatcher;
    private readonly bodyLineParser: LineMatcher;

    constructor() {
        this.headerLineParser = new HeaderLineParser();
        this.bodyLineParser = new BodyLineParser();
    }
    public match(line: string): HistoryParser {
        // const matchLine = line.match(REHeaderLine);
        const headerLine = this.headerLineParser.match(line);
        if (headerLine.matched) {
            return headerLine.historyParser;
        }
        return this.bodyLineParser;




        if (matchMetaLine && matchMetaLine.length == 3) {
            const metaLine = HeaderLineParser(matchMetaLine[1], matchMetaLine[2]);
            if (metaLine.isOk()) {
                metaLine.assignCommit(this.getCommit(line));
            } else {
                console.log(line, metaLine.error);
                this.out.next(new GitCommitUnknownMeta(line, metaLine.error));
            }
        } else {
            console.log(matchMetaLine, line.line);
        }
        if (matchMetaLine && matchMetaLine.length == 3) {
            return this;
        } else {
            return this;
        }
    }

    public parse(): HistoryParser {
        return null;
    }
}

export class GitCommitParser {
    private readonly out: Rx.Subject<GitHistoryMsg>;

    private _commit?: GitCommit;
    private lineMatcher: LineMatcher;

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
        this.lineMatcher = this.lineMatcher.match(line.line).parse();
    }
}
