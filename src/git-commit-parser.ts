import * as Rx from 'rxjs';
import { GitCommit } from './msg/git-commit';
import { GitCommitDone } from './msg/git-commit-done';
import { GitHistoryMsg } from './msg/git-history-msg';
import { FeedLine } from './msg/feed-line';
import { matchHeaderLine } from './header-line-parser';
import { LineMatcher } from './line-matcher';
import { FeedDone } from './msg/feed-done';

function done(gitCommit: GitCommit, out: Rx.Subject<GitHistoryMsg>): void {
    console.log(`done`);
    gitCommit.onComplete(() => {
        out.next(new GitCommitDone(gitCommit.tid));
    });
    gitCommit.complete();
}

export class ProcessHeader implements LineMatcher {
    private readonly out: Rx.Subject<GitHistoryMsg>;
    private readonly gitCommit: GitCommit;
    private readonly processMessage: LineMatcher;

    public constructor(tid: string, out: Rx.Subject<GitHistoryMsg>) {
        this.out = out;
        this.gitCommit = new GitCommit(tid);
        this.gitCommit.onComplete(() => {
            console.log(`ProcessHeader:`, this.gitCommit);
            this.out.next(this.gitCommit);
        });
        this.processMessage = new ProcessMessage(this.gitCommit, out);
    }

    public match(line: string): LineMatcher {
        const next = matchHeaderLine(this, this.gitCommit, line);
        if (next) {
            return next;
        } else {
            return this.processMessage.match(line);
        }
    }

    public done(): void {
        done(this.gitCommit, this.out);
    }
}

class ProcessMessage implements LineMatcher {
    private readonly out: Rx.Subject<GitHistoryMsg>;
    private readonly gitCommit: GitCommit;

    public constructor(gitCommit: GitCommit, out: Rx.Subject<GitHistoryMsg>) {
        this.gitCommit = gitCommit;
        this.out = out;
    }

    public match(line: string): LineMatcher {
        if (/^\S+/.test(line)) {
            this.gitCommit.complete();
            // next commit
            const processMessage = new ProcessHeader(this.gitCommit.tid, this.out);
            return processMessage.match(line);
        } else {
            this.gitCommit.message.push(line);
            return this;
        }
    }

    public done(): void {
        done(this.gitCommit, this.out);
    }
}

export class GitCommitParser {
    private readonly out: Rx.Subject<GitHistoryMsg>;
    private readonly tid: string;

    private lineMatcher: LineMatcher;

    constructor(tid: string, out: Rx.Subject<GitHistoryMsg>) {
        this.tid = tid;
        this.out = out;
        this.lineMatcher = new ProcessHeader(tid, out);
    }

    public next(msg: GitHistoryMsg): void {
        // console.log('GitCommitParser:', msg, this.tid);
        FeedLine.is(msg).hasTid(this.tid).match(line => {
            this.lineMatcher = this.lineMatcher.match(line.line);
        });
        FeedDone.is(msg).hasTid(this.tid).match(_ => {
            // console.log(`Done`);
            this.lineMatcher.done();
        });
    }
}
