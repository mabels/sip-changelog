import { MsgBus } from '../msg-bus';
import { CliConfig } from '../msg/cli-config';
import * as fs from 'fs';
import { Readable } from 'stream';
import * as execa from 'execa';

import { GitHistoryError } from '../msg/git-history-error';
import { StreamOpen } from '../msg/stream-open';
import { StreamData } from '../msg/stream-data';
import { StreamDone } from '../msg/stream-done';

function streamActor(msgBus: MsgBus, tid: string, inStream: Readable): void {
  msgBus.next(new StreamOpen(tid, inStream));
  inStream.on('data', (chunk: Buffer) => {
    // console.error('data', action.fname);
    msgBus.next(new StreamData(tid, chunk.toString()));
  }).on('end', () => {
    // console.error('end', action.fname);
    msgBus.next(new StreamDone(tid));
  }).on('error', (err: Error) => {
    msgBus.next(new GitHistoryError(tid, err));
  });
}

export class StreamProcessor {

  public static create(msgBus: MsgBus): StreamProcessor {
    return new StreamProcessor(msgBus);
  }

  private constructor(msgBus: MsgBus) {
    msgBus.subscribe(msg => {
      CliConfig.is(msg).match(cliConfig => {
        if (!cliConfig.config.file) {
          const child = execa.shell(`${JSON.stringify(cliConfig.config.gitCmd)} ${cliConfig.config.gitOptions}`);
          child.catch((err) => {
            if (err) {
              msgBus.next(new GitHistoryError(cliConfig.tid, err));
            }
          });
          child.stderr.pipe(process.stderr);
          streamActor(msgBus, cliConfig.tid, child.stdout);
        } else {
          streamActor(msgBus, cliConfig.tid, fs.createReadStream(cliConfig.config.file));
        }
      });
    });
  }

}
