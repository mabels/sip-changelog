
export class Message {
  public readonly lines: string[] = [];

  public push(line: string): void {
    this.lines.push(line);
  }

  public text(): string {
    let stripHead = this.lines.filter(line => line.length >= 4);
    return stripHead.map(i => i.slice(4).replace(/\s+$/, '')).join('\n');
  }

  public excerpt(len = 60): string {
    let excerpt = this.text().trim().split('\n')[0];
    if (excerpt.length > len) {
      excerpt = excerpt.slice(0, len - '...'.length) + '...';
    }
    return excerpt;
  }
}
