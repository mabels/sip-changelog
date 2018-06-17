
export const enum TagFlag {
    NONE = 'none',
    HEAD = 'HEAD',
    TAG = 'tag'
}

const TAGFLAGS = new Map<string, TagFlag>([
    ['HEAD', TagFlag.HEAD],
    ['tag', TagFlag.TAG]
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
        const tagSplit = tagStr.split(/->|:/).map(s => s.trim());
        this.branch = tagSplit[tagSplit.length - 1];
        if (tagSplit.length > 1) {
            const flag = tagSplit[0];
            let found = false;
            console.error(flag, found);
            for (let tStr of TAGFLAGS.keys()) {
                console.error(flag, tStr);
                if (tStr == flag) {
                    this.flag = TAGFLAGS.get(tStr);
                    found = true;
                    break;
                }
            }
            if (!found) {
                // tslint:disable-next-line:max-line-length
                throw new Error(`unknown Tagflags:${JSON.stringify(Array.from(TAGFLAGS.keys()))},${JSON.stringify(tagSplit)}`);
            }
        } else {
            this.flag = TagFlag.NONE;
        }

    }
}
