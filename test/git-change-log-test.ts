import { assert } from 'chai';
import { Cli } from '../src/cli';
import { HelpMsg } from '../src/msg/help-msg';
import { GroupMsg } from '../src/msg/group-msg';
import { GitHistoryDone } from '../src/msg/git-history-done';
import { GitHistoryError } from '../src/msg/git-history-error';
import { GitHistoryMsg } from '../src/msg/git-history-msg';
import { GitCommit } from '../src/msg/git-commit';

function msgDefault(msg: GitHistoryMsg, done: MochaDone): void {
  GitHistoryError.is(msg).match(err => {
    done(err.error);
  });
  GitHistoryDone.is(msg).match(_ => {
    done();
  });
}

function changeLogDefault(msg: GitHistoryMsg, done: MochaDone): void {
  const groupMsgs: GroupMsg[] = [];
  GroupMsg.is(msg).match(groupMsg => {
    groupMsgs.push(groupMsg);
  });
  GitHistoryDone.is(msg).match(_ => {
    try {
      assert.equal(groupMsgs.length, 1);
      const stories = groupMsgs[0].stories;
      // const commits = stories[stories.length - 1].commits;
      // assert.equal(commits[commits.length - 1].commit.sha, '7c183b29ba6e8c2d126fda11d52cd20321aa59a6');
      done();
    } catch (e) {
      done(e);
    }
  });
  msgDefault(msg, done);
}

describe('git-change-log', () => {

  // it('--help', (done) => {
  //   Cli.factory(['--help']).subscribe(msg => {
  //     HelpMsg.is(msg).match(help => {
  //       assert.isTrue(!help.lines.find(i => i.includes('WTF')));
  //     });
  //     msgDefault(msg, done);
  //   });
  // });

  // it('--unknown-option', (done) => {
  //   Cli.factory(['--unknown-option']).subscribe(msg => {
  //     HelpMsg.is(msg).match(help => {
  //       assert.isTrue(!help.lines.find(i => i.includes('WTF')));
  //     });
  //   });
  // });

  // it('--story-match', (done) => {
  //   Cli.factory(['--story-match', 'LUX-\d+', '--ignore-case']).subscribe(msg => {
  //     GroupMsg.is(msg).match(groupMsg => {
  //       assert.equal(groupMsg.name, 'WTF');
  //       // const storyNames = groupMsg.stories.map(i => i.name);
  //       // assert.isTrue(storyNames.length > 0);
  //       //  assert.equal(storyNames, storyNames.filter(i => /lux-\d+/g.test(i)));
  //     });
  //     msgDefault(msg, done);
  //   });
  // });

  // it('--group-by-tag', (done) => {
  //   Cli.factory(['--group-by-tag', 'dt-LUX-']).subscribe(msg => {
  //     const groupMsgs: GroupMsg[] = [];
  //     GroupMsg.is(msg).match(groupMsg => {
  //       assert.isTrue(groupMsg.name.startsWith('dt-LUX-'));
  //       groupMsgs.push(groupMsg);
  //     });
  //     GitHistoryDone.is(msg).match(_ => {
  //       assert.equal(groupMsgs.map(g => g.name), groupMsgs.map(g => g.name).sort((a, b) => {
  //         if (a < b) {
  //           return 1;
  //         } else if (a > b) {
  //           return -1;
  //         }
  //         return 0;
  //       }));
  //     });
  //     msgDefault(msg, done);
  //   });
  // });

  // it('--start', (done) => {
  //   Cli.factory(['--start', 'rb-LUX-start']).subscribe(msg => {
  //     const groupMsgs: GroupMsg[] = [];
  //     GroupMsg.is(msg).match(groupMsg => {
  //       groupMsgs.push(groupMsg);
  //     });
  //     GitHistoryDone.is(msg).match(_ => {
  //       assert.equal(groupMsgs[groupMsgs.length - 1].name, 'rb-LUX-start');
  //       // assert.equal(groupMsgs[groupMsgs.length - 1].stories.length, 0);
  //     });
  //     msgDefault(msg, done);
  //   });
  // });

  // it('default', (done) => {
  //   Cli.factory([]).subscribe(msg => {
  //     changeLogDefault(msg, done);
  //   });
  // });

  // it('--git-cmd', (done) => {
  //   Cli.factory(['--git-cmd', 'git']).subscribe(msg => {
  //     changeLogDefault(msg, done);
  //   });
  // });

  // it('--file', (done) => {
  //   Cli.factory(['--file', 'test/git-history.sample']).subscribe(msg => {
  //     changeLogDefault(msg, done);
  //   });
  // });

});
