import { LineMatcher } from './line-matcher';

export interface HistoryParser {
    parse(): LineMatcher;
}
