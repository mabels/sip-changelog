
export class Message {
  public readonly lines: string[] = [];

  public push(line: string): void {
    this.lines.push(line);
  }

  public text(): string {
    // The 4 is not error prone
    let stripHead = this.lines.slice(1);
    // console.log(stripHead);
    if (stripHead[stripHead.length - 1].trim() === '') {
      stripHead = stripHead.slice(0, -1);
    }
    return stripHead.map(i => i.slice(4)).join('\n');
  }
}
