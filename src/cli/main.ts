import { Cli } from './index';
import { CliOutputMsg } from '../msg/cli-output-msg';
import { GitCommitDone } from '../msg/git-commit-done';
import { GitHistoryError } from '../msg/git-history-error';
import { GitHistoryStart } from '../msg/git-history-start';

const gh = Cli.factory([]);
gh.subscribe(msg => {
  CliOutputMsg.is(msg).match(com => {
    com.output(process.stdout, process.stderr);
  });
  GitHistoryError.is(msg).match(err => {
    err.output(process.stdout, process.stderr);
  });
  GitCommitDone.is(msg).match(_ => {
    process.exit(0);
  });
});
gh.next(gh.startMsg());
