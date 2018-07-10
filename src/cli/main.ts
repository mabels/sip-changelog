import * as uuid from 'uuid';
import { MsgBus } from '../msg-bus';
import { CliProcessor } from '../processors/cli-processor';
import { StreamProcessor } from '../processors/stream-processor';
import { LineProcessor } from '../processors/line-processor';
import { GitCommitProcessor } from '../processors/git-commit-processor';
import { CliArgs } from '../msg/cli-args';
// import { Cli } from '.';
// import { CliOutputMsg } from '../msg/cli-output-msg';
// import { GitHistoryError } from '../msg/git-history-error';
// import { GitHistoryDone } from '../msg/git-history-done';

// Cli.factory(process.argv).then(gh => {
//   gh.subscribe(msg => {
//     // console.log(msg.constructor.name);
//     CliOutputMsg.is(msg).match(com => {
//       console.log(`CliOutputMsg:`, msg.constructor.name);
//       com.output(process.stdout, process.stderr);
//     });
//     GitHistoryError.is(msg).match(err => {
//       err.output(process.stdout, process.stderr);
//       process.exit(1);
//     });
//     GitHistoryDone.is(msg).match(_ => {
//       // process.exit(0);
//     });
//   });
//   gh.next(gh.startMsg(process.argv));
// });

const tid = uuid.v4();
const bus = new MsgBus();
const cliProc = new CliProcessor(bus);
const streamProc = new StreamProcessor(bus);
const lineProc = new LineProcessor(bus);
const gitProc = new GitCommitProcessor(bus);

bus.next(new CliArgs(tid, process.argv));
