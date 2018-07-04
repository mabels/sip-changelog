import { assert } from 'chai';
import { GroupMsg } from '../src/msg/group-msg';
import { GitHistoryDone } from '../src/msg/git-history-done';
import { GitHistoryError } from '../src/msg/git-history-error';
import { GitHistoryMsg } from '../src/msg/git-history-msg';
import { Cli } from '../src/cli';
import { GroupMsgDone } from '../src/msg/group-msg-done';
import { GitCommit } from '../src/msg/git-commit';
import { FeedLine } from '../src/msg/feed-line';
import { FeedDone } from '../src/msg/feed-done';
import { NOTINITIALIZED } from 'dns';

class MsgDefault {
  private readonly dones: GitHistoryMsg[] = [];
  public is(msg: GitHistoryMsg, done: MochaDone): void {
    FeedDone.is(msg).match(_ => {
      this.dones.push(msg);
      // console.log(`feedDone:${this.dones.map(i => i.constructor.name)}`);
      try {
        assert.deepEqual(this.dones.map(i => i.constructor.name), [
          'GitHistoryDone', 'GroupMsgDone', 'FeedDone'
        ]);
        done();
      } catch (e) {
        done(e);
      }
    });
    GroupMsgDone.is(msg).match(_ => {
      // console.log(`groupMsgDone:${this.dones.map(i => i.constructor.name)}`);
      this.dones.push(msg);
    });
    GitHistoryDone.is(msg).match(_ => {
      this.dones.push(msg);
      // console.log(`gitHistoryDone:${this.dones.map(i => i.constructor.name)}`);

    });
    GitHistoryError.is(msg).match(err => {
      done(err.error);
    });
  }
}

class ChangeLogDefault {
  public readonly groupMsgs: GroupMsg[] = [];
  public readonly gitCommits: GitCommit[] = [];
  private readonly reStartTagMatch: RegExp;
  private foundStartTag: boolean;

  constructor(reStartTagMatch: RegExp = new RegExp('should not match')) {
    this.reStartTagMatch = reStartTagMatch;
    this.foundStartTag = false;
  }

  public is(msg: GitHistoryMsg, done: MochaDone): void {
    GitCommit.is(msg).match(gc => {
      if (this.foundStartTag) {
        return;
      }
      this.foundStartTag = gc.commit.tagMatch(this.reStartTagMatch);
      // console.log(this.foundStartTag, this.reStartTagMatch, gc.commit.sha, gc.commit.tagMatch);
      this.gitCommits.push(gc);
    });
    GroupMsg.is(msg).match(groupMsg => {
      this.groupMsgs.push(groupMsg);
    });
    GroupMsgDone.is(msg).match(_ => {
      // console.log(`ChangeLogDefault:GroupMsgDone`);
      try {
        assert.equal(this.groupMsgs.length, 1, 'no grouping');
        const commits = Array.from(this.groupMsgs[0].stories.stories.values()).reduce(
          (accumulator, currentValue) => accumulator.concat(currentValue.gitCommits), []);
        assert.equal(commits.length, this.gitCommits.length, 'commit lenght');
        assert.deepEqual(commits, this.gitCommits, 'commits equal');
        done();
      } catch (e) {
        done(e);
      }
    });
    GitHistoryError.is(msg).match(err => {
      done(err.error);
    });
  }
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
      const msgDefault = new MsgDefault();
      gh.subscribe(msg => {
        GroupMsg.is(msg).match(groupMsg => {
          try {
            assert.deepEqual(groupMsg.names, []);
            assert.deepEqual(Array.from(groupMsg.stories.stories.keys()), ['']);
            const vals = Array.from(groupMsg.stories.stories.values());
            assert.equal(vals.length, 1, `vals.lenght:${vals.length}`);
            assert.isNotOk(vals[0].gitCommits.find(i => i.message.text().length == 0), 'unknown');
          } catch (e) {
            console.error(e);
            done(e);
          }
        });
        msgDefault.is(msg, done);
      });
      gh.next(gh.startMsg(args));
    });
  });

  it('--story-match WIP-\\d+ --no-story-sort-numeric', (done) => {
    const args = ['cli-test', '--story-match', 'WIP-\\d+', '--no-story-sort-numeric',
      '--file', 'test/git-history.sample'];
    Cli.factory(args).then(gh => {
      const msgDefault = new MsgDefault();
      gh.subscribe(msg => {
        GroupMsg.is(msg).match(groupMsg => {
          try {
            assert.deepEqual(groupMsg.names, []);
            const vals = Array.from(groupMsg.stories.stories.values());
            assert.equal(vals.length, 8, `vals.lenght:${vals.length}`);
            assert.isNotOk(vals[0].gitCommits.find(i => !i.message.text().includes('WIP')), 'unknown');
            assert.deepEqual(groupMsg.stories.sort().map(i => i.sortKey), [
              'WIP-1',
              'WIP-11',
              'WIP-15',
              'WIP-19',
              'WIP-2',
              'WIP-3',
              'WIP-4',
              'WIP-7'
            ]);
          } catch (e) {
            console.log(e);
            done(e);
          }
        });
        msgDefault.is(msg, done);
      });
      gh.next(gh.startMsg(args));
    });
  });

  it('--story-match WIP-\\d+ --file test/git-history.sample', (done) => {
    const args = ['cli-test', '--story-match', 'WIP-\\d+',
      '--file', 'test/git-history.sample'];
    Cli.factory(args).then(gh => {
      const msgDefault = new MsgDefault();
      gh.subscribe(msg => {
        GroupMsg.is(msg).match(groupMsg => {
          try {
            assert.deepEqual(groupMsg.names, []);
            const vals = Array.from(groupMsg.stories.stories.values());
            assert.equal(vals.length, 8, `vals.lenght:${vals.length}`);
            assert.isNotOk(vals[0].gitCommits.find(i => !i.message.text().includes('WIP')), 'unknown');
            assert.deepEqual(groupMsg.stories.sort().map(i => i.sortKey), [
              'WIP-1',
              'WIP-2',
              'WIP-3',
              'WIP-4',
              'WIP-7',
              'WIP-11',
              'WIP-15',
              'WIP-19'
            ]);
          } catch (e) {
            console.error(e);
            done(e);
          }
        });
        msgDefault.is(msg, done);
      });
      gh.next(gh.startMsg(args));
    });
  });

  it('--group-by-tag', (done) => {
    const args = ['cli-test', '--group-by-tag', 'dt-(.*)'];
    Cli.factory(args).then(gh => {
      const groupMsgs: GroupMsg[] = [];
      const msgDefault = new MsgDefault();
      gh.subscribe(msg => {
        if (msg.constructor.name != 'FeedLine') {
          // console.log('msg:', msg.constructor.name);
        }
        GroupMsg.is(msg).match(groupMsg => {
          groupMsgs.push(groupMsg);
          // console.log('push', groupMsg.names);
        });
        GroupMsgDone.is(msg).match(_ => {
          try {
            assert.deepEqual(groupMsgs.map(g => g.names), [
              [],
              ['dt-lux-4'],
              ['dt-lux-3'],
              ['dt-lux-2', 'dt-lux-2-a'],
              ['dt-lux-1'],
              ['dt-lux-start']
            ]);
          } catch (e) {
            console.error(e);
            done(e);
          }
        });
        msgDefault.is(msg, done);
      });
      gh.next(gh.startMsg(args));
    });
  });

  it('--git-cmd', (done) => {
    const args = ['cli-test', '-git-cmd'];
    Cli.factory(['--git-cmd', 'cat', '--git-options', 'test/git-history.sample']).then(gh => {
      const cld = new ChangeLogDefault();
      gh.subscribe(msg => {
        // console.log(msg.constructor.name);
        cld.is(msg, done);
      });
      gh.next(gh.startMsg(args));
    });
  });

  it('--git-cmd long', (done) => {
    const args = ['--git-cmd', 'cat', '--git-options',
      (new Array(100)).fill('test/git-history.sample').join(' ')
    ];
    Cli.factory(args).then(gh => {
      const cld = new ChangeLogDefault();
      // let lines = 0;
      gh.subscribe(msg => {
        // FeedLine.is(msg).match(_ => ++lines);
        // FeedDone.is(msg).match(_ => console.log(lines));
        cld.is(msg, done);
      });
      gh.next(gh.startMsg(args));
    });
  });

  it('--file', (done) => {
    const args = ['cli-test', '--file', 'test/git-history.sample'];
    Cli.factory(args).then(gh => {
      const cld = new ChangeLogDefault();
      gh.subscribe(msg => {
        // console.log(msg.constructor.name);
        cld.is(msg, done);
      });
      gh.next(gh.startMsg(args));
    });
  });

  it('--start text', (done) => {
    const args = ['--start', 'rb-LUX-start'];
    Cli.factory(args).then(gh => {
      const cld = new ChangeLogDefault(/rb-LUX-start/);
      gh.subscribe(msg => {
        // console.log(`starting:`, msg.tid, msg.id, msg.constructor.name);
        GroupMsgDone.is(msg).match(_ => {
          try {
            const gend = cld.groupMsgs.length - 1;
            const storyGitCommits = Array.from(cld.groupMsgs[gend].stories.stories.values());
            const send = storyGitCommits.length - 1;
            const gitCommits = storyGitCommits[send].gitCommits;
            assert.equal(gitCommits[gitCommits.length - 1].commit.sha, '34927334197b831f7fb62209d3b80ddea6bb777f');
          } catch (e) {
            done(e);
          }
        });
        cld.is(msg, done);
      });
      gh.next(gh.startMsg(args));
    });
  });

  it('--start sha', (done) => {
    const args = ['--start', '34197b831f7fb622', '--no-story-sort-numeric'];
    Cli.factory(args).then(gh => {
      const cld = new ChangeLogDefault(/34197b831f7fb622/);
      gh.subscribe(msg => {
        // console.log(`starting:`, msg.tid, msg.id, msg.constructor.name);
        GroupMsgDone.is(msg).match(_ => {
          try {
            const gend = cld.groupMsgs.length - 1;
            const storyGitCommits = Array.from(cld.groupMsgs[gend].stories.stories.values());
            // tslint:disable-next-line:max-line-length
            assert.equal(cld.gitCommits[cld.gitCommits.length - 1].commit.sha, '34927334197b831f7fb62209d3b80ddea6bb777f');
            const send = storyGitCommits.length - 1;
            const gitCommits = storyGitCommits[send].gitCommits;
            assert.equal(gitCommits[gitCommits.length - 1].commit.sha, '34927334197b831f7fb62209d3b80ddea6bb777f');
          } catch (e) {
            done(e);
          }
        });
        cld.is(msg, done);
      });
      gh.next(gh.startMsg(args));
    });
  });

  // it('default', (done) => {
  //   Cli.factory([]).subscribe(msg => {
  //     changeLogDefault(msg, done);
  //   });
  // });

});
