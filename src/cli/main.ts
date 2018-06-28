import { Cli } from './index';
import { CliOutputMsg } from '../msg/cli-output-msg';
import { GitCommitDone } from '../msg/git-commit-done';
import { GitHistoryError } from '../msg/git-history-error';

Cli.factory(process.argv).then(gh => {
  gh.subscribe(msg => {
    // console.log(msg.constructor.name);
    CliOutputMsg.is(msg).match(com => {
      com.output(process.stdout, process.stderr);
    });
    GitHistoryError.is(msg).match(err => {
      err.output(process.stdout, process.stderr);
      process.exit(1);
    });
    GitCommitDone.is(msg).match(_ => {
      process.exit(0);
    });
  });
  gh.next(gh.startMsg(process.argv));
});
