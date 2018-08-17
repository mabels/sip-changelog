import * as uuid from 'uuid';

import { MsgBus } from '../src/msg-bus';
import { CliProcessor } from '../src/processors/cli-processor';
import { StreamProcessor } from '../src/processors/stream-processor';
import { LineProcessor } from '../src/processors/line-processor';
import { GitCommitProcessor } from '../src/processors/git-commit-processor';
import { ChangeLogProcessor } from '../src/processors/change-log-processor';
import { OutputProcessor } from '../src/processors/output-processor';
import { CliArgs } from '../src/msg/cli-args';

describe('output-process-test', () => {
  it('text-processor', () => {
    const args: string[] = [];
    const bus = new MsgBus();
    const tid = uuid.v4();
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    GitCommitProcessor.create(bus);
    ChangeLogProcessor.create(bus);
    OutputProcessor.create(bus);
    bus.next(new CliArgs(tid, args));
  });
});
