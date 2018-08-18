
export class Message {
  public readonly lines: string[] = [];

  public push(line: string): void {
    this.lines.push(line);
  }

  public textLines(): string[] {
    const skipHeader = this.lines.filter(line => line.length >= 4);
    return skipHeader.map(i => i.slice(4).replace(/\s+$/, ''));
  }

  public text(): string {
    return this.textLines().join('\n');
  }

  public excerpt(len = 60): string {
    let excerpt = this.text().split(/[\r\n]+/)
      .map(i => i.trim())
      .filter(i => !!i)
      .join('|');
    if (excerpt.length > len) {
      excerpt = excerpt.slice(0, len - '...'.length) + '...';
    }
    return excerpt;
  }
}
