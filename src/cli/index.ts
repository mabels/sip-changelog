import * as fs from 'fs';
import { Readable } from 'stream';
import * as execa from 'execa';

// import { GitHistory } from '../git-history';
import { GitHistoryError } from '../msg/git-history-error';
import { FeedChunk } from '../msg/feed-chunk';
import { GitHistoryStart } from '../msg/git-history-start';
import { GitCommit } from '../msg/git-commit';
import { GitCommitDone } from '../msg/git-commit-done';
// import { ChangeLog } from './change-log';
import { FeedChunkDone } from '../msg/feed-chunk-done';
// import { SipChangeLog } from '../sip-change-log';
import { MsgBus } from '../msg-bus';
import { CliArgs } from '../msg/cli-args';
import { CliConfig } from '../msg/cli-config';

const OclifErrorHandler = require('@oclif/errors/handle');

/*
function feedGitHistory(gh: GitHistory, streamGitHistory: Readable): void {
  streamGitHistory.on('data', (chunk: Buffer) => {
    // console.error('data', action.fname);
    gh.next(new FeedChunk(gh.tid, chunk.toString()));
  }).on('end', () => {
    // console.error('end', action.fname);
    gh.next(new FeedChunkDone(gh.tid));
  }).on('error', (err: Error) => {
    gh.next(new GitHistoryError(gh.tid, err));
  });
}

try {
  const config = await SipChangeLog.run(args);
    // gh.subscribe(msg => {
    //   GitHistoryStart.is(msg).hasTid(gh.tid).match(_ => {
    //     gh.next(config);
    //   });
    // });
  // console.log(args, config);
  const changeLog = new ChangeLog(bus, gh.tid, config);
  // changeLog.onNewGroupMsg((gmsg) => {
  //   gh.next(gmsg.msgStart());
  // });
  gh.subscribe(msg => {
    // console.log(msg);
    GitCommit.is(msg).hasTid(gh.tid).match(gc => {
      changeLog.add(gc);
    });
    GitCommitDone.is(msg).hasTid(gh.tid).match(_ => {
      // console.log(`GitCommitDone:recv:i`);
      changeLog.forEach(gm => gh.next(gm));
      const lastGroupMsg = changeLog.currentGroupMsg();
      console.log(`GitCommitDone`);
      if (lastGroupMsg) {
        gh.next(lastGroupMsg.msgDone());
      }
      // console.log(`GitCommitDone:recv:o`);
    });
    GitHistoryStart.is(msg).hasTid(gh.tid).match(_ => {
      if (!config.file) {
        const child = execa.shell(`${JSON.stringify(config.gitCmd)} ${config.gitOptions}`);
        child.catch((err) => {
          if (err) {
            console.log(`exec error`, err);
            gh.next(gh.errorMsg(err));
            gh.next(gh.doneMsg());
          }
        });
        child.stderr.pipe(process.stderr);
        feedGitHistory(gh, child.stdout);
      } else {
        feedGitHistory(gh, fs.createReadStream(config.file));
      }
    });
  });
} catch (e) {
}
return gh;
}
*/

// export class Cli {

//   public static start(bus: MsgBus): void {
//     bus.inS.subscribe(msg => {
//       CliArgs.is(msg).match(cliArgs => {
//         SipChangeLog.run(cliArgs.args).then(config => {
//           if (config.help) {
//             return;
//           }
//           bus.bus.next(new CliConfig(cliArgs.tid, config));
//         }).catch(e => OclifErrorHandler(e));
//       });
//     });
//   }
// }
