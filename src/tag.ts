
export const enum TagFlag {
    NONE,
    HEAD
}

const tagFlags = new Map<string, TagFlag>([
    ['HEAD', TagFlag.HEAD]
]);

export class Tag {
    public readonly branch: string;
    public readonly flag: TagFlag;

    public static parse(str: string): Tag[] {
        return str.split(',').map(s => s.trim()).map(tag => new Tag(tag));
    }

    private constructor(tagStr: string) {
        // tslint:disable-next-line:max-line-length
        // HEAD -> refs/heads/rb-release_2.0, refs/remotes/origin/rb-release_2.0, refs/remotes/origin/integration-release)
        const tagSplit = tagStr.split('->').map(s => s.trim());
        this.branch = tagSplit[tagSplit.length - 1];
        if (tagSplit.length > 1) {
            const flag = tagSplit[0];
            let found = false;
            for (let tStr in tagFlags) {
                const enumFlag = tagFlags.get(tStr);
                if (tStr == flag) {
                    this.flag = enumFlag;
                    found = true;
                    break;
                }
            }
            if (!found) {
                throw new Error(`unknown Tagflag:${tagSplit}`);
            }
        } else {
            this.flag = TagFlag.NONE;
        }

    }
}
