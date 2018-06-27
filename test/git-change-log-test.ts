import { assert } from 'chai';
import { GroupMsg } from '../src/msg/group-msg';
import { GitHistoryDone } from '../src/msg/git-history-done';
import { GitHistoryError } from '../src/msg/git-history-error';
import { GitHistoryMsg } from '../src/msg/git-history-msg';
import { Cli } from '../src/cli';
import { GroupMsgDone } from '../src/msg/group-msg-done';

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

  it('no param', (done) => {
    const args = ['cli-test'];
    Cli.factory(args).then(gh => {
      gh.subscribe(msg => {
        GroupMsg.is(msg).match(groupMsg => {
          try {
            assert.equal(groupMsg.name, '');
            assert.deepEqual(Array.from(groupMsg.stories.stories.keys()), ['']);
            const vals = Array.from(groupMsg.stories.stories.values());
            assert.equal(vals.length, 1, `vals.lenght:${vals.length}`);
            assert.isNotOk(vals[0].find(i => i.message.text().length == 0), 'unknown');
          } catch (e) {
            console.error(e);
            done(e);
          }
        });
        msgDefault(msg, done);
      });
      gh.next(gh.startMsg(args));
    });
  });

  it('--story-match', (done) => {
    const args = ['cli-test', '--story-match', 'IP'];
    Cli.factory(args).then(gh => {
      gh.subscribe(msg => {
        GroupMsg.is(msg).match(groupMsg => {
          try {
            assert.equal(groupMsg.name, '');
            assert.deepEqual(Array.from(groupMsg.stories.stories.keys()), ['IP']);
            const vals = Array.from(groupMsg.stories.stories.values());
            assert.equal(vals.length, 1, `vals.lenght:${vals.length}`);
            assert.isNotOk(vals[0].find(i => !i.message.text().includes('IP')), 'unknown');
          } catch (e) {
            console.error(e);
            done(e);
          }
        });
        msgDefault(msg, done);
      });
      gh.next(gh.startMsg(args));
    });
  });

  it('--group-by-tag', (done) => {
    const args = ['cli-test', '--group-by-tag', 'dt-(.*)'];
    Cli.factory(args).then(gh => {
      const groupMsgs: GroupMsg[] = [];
      gh.subscribe(msg => {
        console.log(msg.constructor.name);
        GroupMsg.is(msg).match(groupMsg => {
          groupMsgs.push(groupMsg);
        });
        GroupMsgDone.is(msg).match(_ => {
          console.log(groupMsgs);
          try {
            assert.deepEqual(groupMsgs.map(g => g.name), groupMsgs.map(g => g.name).sort((a, b) => {
              if (a < b) {
                return 1;
              } else if (a > b) {
                return -1;
              }
              return 0;
            }));
          } catch (e) {
            done(e);
          }
        });
        msgDefault(msg, done);
      });
      gh.next(gh.startMsg(args));
    });
  });

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
