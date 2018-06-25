import * as Rx from 'rxjs';
import { GitCommit } from './msg/git-commit';
import { GitCommitDone } from './msg/git-commit-done';
import { GitHistoryMsg } from './msg/git-history-msg';
import { FeedLine } from './msg/feed-line';
import { matchHeaderLine } from './header-line-parser';
import { LineMatcher } from './line-matcher';
import { FeedDone } from './msg/feed-done';

function done(gitCommit: GitCommit, out: Rx.Subject<GitHistoryMsg>): void {
    // console.log(`done`);
    gitCommit.onComplete(() => {
        out.next(new GitCommitDone(gitCommit.tid));
    });
    gitCommit.complete();
}

class ProcessMessage implements LineMatcher {
    private readonly ouS: Rx.Subject<GitHistoryMsg>;
    private readonly gitCommit: GitCommit;
    private readonly processHeaderFactory: () => LineMatcher;

    public constructor(gitCommit: GitCommit, ouS: Rx.Subject<GitHistoryMsg>,
        processHeaderFactory: () => LineMatcher) {
        this.processHeaderFactory = processHeaderFactory;
        this.gitCommit = gitCommit;
        this.ouS = ouS;
    }

    public match(line: string): LineMatcher {
        if (/^\S+/.test(line)) {
            this.gitCommit.complete();
            // next commit
            // const processMessage = new ProcessHeader(this.gitCommit.tid, this.ouS);
            return this.processHeaderFactory().match(line);
        } else {
            this.gitCommit.message.push(line);
            return this;
        }
    }

    public done(): void {
        done(this.gitCommit, this.ouS);
    }
}

export class ProcessHeader implements LineMatcher {
    private readonly ouS: Rx.Subject<GitHistoryMsg>;
    private readonly tid: string;
    private readonly gitCommit: GitCommit;
    private readonly processMessage: LineMatcher;

    public constructor(tid: string, ouS: Rx.Subject<GitHistoryMsg>) {
        this.tid = tid;
        this.ouS = ouS;
        this.gitCommit = new GitCommit(tid);
        this.gitCommit.onComplete((gc) => {
            // console.log(`ProcessHeader:`, this.gitCommit);
            if (gc.isComplete()) {
                this.ouS.next(gc);
            }
        });
        this.processMessage = new ProcessMessage(this.gitCommit, this.ouS,
            () => new ProcessHeader(this.tid, ouS));
    }

    public match(line: string, ): LineMatcher {
        const next = matchHeaderLine(this, this.gitCommit, line, this.tid, this.ouS);
        if (next) {
            return next;
        } else {
            return this.processMessage.match(line);
        }
    }

    public done(): void {
        done(this.gitCommit, this.ouS);
    }
}

export class GitCommitParser {
    // private readonly ouS: Rx.Subject<GitHistoryMsg>;
    private readonly tid: string;

    private lineMatcher: LineMatcher;

    constructor(tid: string, ouS: Rx.Subject<GitHistoryMsg>) {
        this.tid = tid;
        // this.ouS = ouS;
        this.lineMatcher = new ProcessHeader(tid, ouS);
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
