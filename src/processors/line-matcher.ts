
export interface LineMatcher {
  match(a: string): LineMatcher;
  done(): void;
}
