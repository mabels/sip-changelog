import { HistoryParser } from './history-parser';

export interface LineMatched {
    matched: boolean;
    historyParser: HistoryParser;
}

export interface LineMatcher {
    match(a: string): LineMatched;
}
