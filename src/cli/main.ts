// import { Cli } from '.';
import { CliOutputMsg } from '../msg/cli-output-msg';
import { GitHistoryError } from '../msg/git-history-error';
import { GitHistoryDone } from '../msg/git-history-done';

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
