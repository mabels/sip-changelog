import * as uuid from 'uuid';
import { assert } from 'chai';
import { GroupMsg } from '../src/msg/group-msg';
// import { GitHistoryDone } from '../src/msg/git-history-done';
import { GitHistoryError } from '../src/msg/git-history-error';
import { GitHistoryMsg } from '../src/msg/git-history-msg';
import { GroupMsgDone } from '../src/msg/group-msg-done';
import { GitCommit } from '../src/msg/git-commit';
import { MsgBus } from '../src/msg-bus';
import { ChangeLogProcessor } from '../src/processors/change-log-processor';
import { GitCommitProcessor } from '../src/processors/git-commit-processor';
import { LineProcessor } from '../src/processors/line-processor';
import { StreamProcessor } from '../src/processors/stream-processor';
import { CliProcessor } from '../src/processors/cli-processor';
import { CliArgs } from '../src/msg/cli-args';
import { ChangeLogDone } from '../src/msg/change-log-done';
import { LineDone } from '../src/msg/line-done';
import { GroupMsgAddCommit } from '../src/msg/group-msg-add-commit';

class MsgDefault {
  private readonly dones: GitHistoryMsg[] = [];
  public is(msg: GitHistoryMsg, done: MochaDone): void {
    this.dones.push(msg);
    // console.log(msg);
    LineDone.is(msg).match(_ => {
      // console.log(`feedDone:${this.dones.map(i => i.constructor.name)}`);
      // Live Cyle test
      const order = [
        'GitCommitOpen',
        'LineOpen',
        'StreamOpen',
        'ChangeLogOpen',
        'StreamDone',
        'ChangeLogDone',
        'GitCommitDone',
        'LineDone'
      ];
      try {
        assert.deepEqual(this.dones
          .map(i => i.constructor.name)
          .filter(i => order.indexOf(i) >= 0),
          order);
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

class ChangeLogDefault {
  // public readonly groupMsgs: GroupMsg[] = [];
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
    // GroupMsgAddCommit.is(msg).match(({ groupMsg }) => {
    //   this.groupMsgs.push(groupMsg);
    // });
    GroupMsgDone.is(msg).match(({ groupMsg }) => {
      // console.log(`ChangeLogDefault:GroupMsgDone`);
      try {
        // assert.equal(this.groupMsgs.length, 1, 'no grouping');
        const commits = Array.from(groupMsg.stories.stories.values()).reduce(
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

describe('change-log-processor', () => {

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
    const tid = uuid.v4();
    const bus = new MsgBus();
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    GitCommitProcessor.create(bus);
    ChangeLogProcessor.create(bus);
    // const msgs: GitHistoryMsg[] = [];
    // const datas: GitCommit[] = [];
    const msgDefault = new MsgDefault();
    bus.subscribe(msg => {
      // GroupMsg.is(msg).match(groupMsg => {
      //   try {
      //     console.log(groupMsg);
      //     assert.deepEqual(groupMsg.names, []);
      //     assert.deepEqual(Array.from(groupMsg.stories.stories.keys()), ['']);
      //     const vals = Array.from(groupMsg.stories.stories.values());
      //     assert.equal(vals.length, 1, `vals.length:${vals.length}`);
      //     assert.isNotOk(vals[0].gitCommits.find(i => i.message.text().length == 0), 'unknown');
      //   } catch (e) {
      //     console.error(e);
      //     done(e);
      //   }
      // });
      msgDefault.is(msg, done);
    });
    bus.next(new CliArgs(tid, args));
  });

  it('--story-match WIP-\\d+ --no-story-sort-numeric', (done) => {
    const bus = new MsgBus();
    const args = ['cli-test', '--story-match', 'WIP-\\d+', '--no-story-sort-numeric',
      '--file', 'test/git-history.sample'];
    const tid = uuid.v4();
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    GitCommitProcessor.create(bus);
    ChangeLogProcessor.create(bus);
    const msgDefault = new MsgDefault();
    let gotGroupMsgDone = 0;
    bus.subscribe(msg => {
      // console.log(msg.constructor.name);
      GroupMsgDone.is(msg).match(({ groupMsg }) => {
        gotGroupMsgDone++;
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
      msgDefault.is(msg, (e) => {
        if (e) { done(e); return; }
        try {
          assert.equal(gotGroupMsgDone, 1);
          done();
        } catch (e) {
          console.error(e);
          done(e);
        }
      });
    });
    bus.next(new CliArgs(tid, args));
  });

  it('--story-match WIP-\\d+ --file test/git-history.sample', (done) => {
    const bus = new MsgBus();
    const tid = uuid.v4();
    const args = ['cli-test', '--story-match', 'WIP-\\d+',
      '--file', 'test/git-history.sample'];
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    GitCommitProcessor.create(bus);
    ChangeLogProcessor.create(bus);
    const msgDefault = new MsgDefault();
    let gotGroupMsgDone = false;
    bus.subscribe(msg => {
      GroupMsgDone.is(msg).match(({ groupMsg }) => {
        gotGroupMsgDone = true;
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
      msgDefault.is(msg, (e) => {
        if (e) { done(e); return; }
        try {
          assert.isTrue(gotGroupMsgDone);
          done();
        } catch (e) {
          console.error(e);
          done(e);
        }
      });
    });
    bus.next(new CliArgs(tid, args));
  });

  it('--group-by-tag', (done) => {
    const args = ['cli-test', '--group-by-tag', 'dt-(.*)'];
    const bus = new MsgBus();
    const tid = uuid.v4();
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    GitCommitProcessor.create(bus);
    ChangeLogProcessor.create(bus);

    const groupMsgs: GroupMsg[] = [];
    const msgDefault = new MsgDefault();
    bus.subscribe(msg => {
      if (msg.constructor.name != 'FeedLine') {
        // console.log('msg:', msg.constructor.name);
      }
      GroupMsgDone.is(msg).match(({ groupMsg }) => {
        groupMsgs.push(groupMsg);
        // console.log('push', groupMsg.names);
      });
      msgDefault.is(msg, () => {
        try {
          assert.deepEqual(groupMsgs.map(g => g.names), [
            [],
            ['dt-lux-4'],
            ['dt-lux-3'],
            ['dt-lux-2', 'dt-lux-2-a'],
            ['dt-lux-1'],
            ['dt-lux-start']
          ]);
          done();
        } catch (e) {
          console.error(e);
          done(e);
        }
      });
    });
    bus.next(new CliArgs(tid, args));
  });

  it('--git-cmd', (done) => {
    const args = ['cli-test', '--git-cmd', 'cat', '--git-options', 'test/git-history.sample'];
    const bus = new MsgBus();
    const tid = uuid.v4();
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    GitCommitProcessor.create(bus);
    ChangeLogProcessor.create(bus);
    const cld = new ChangeLogDefault();
    bus.subscribe(msg => {
      // console.log(msg.constructor.name);
      cld.is(msg, done);
    });
    bus.next(new CliArgs(tid, args));
  });

  it('--git-cmd long', (done) => {
    const args = ['--git-cmd', 'cat', '--git-options',
      (new Array(100)).fill('test/git-history.sample').join(' ')
    ];
    const bus = new MsgBus();
    const tid = uuid.v4();
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    GitCommitProcessor.create(bus);
    ChangeLogProcessor.create(bus);
    const cld = new ChangeLogDefault();
    // let lines = 0;
    bus.subscribe(msg => {
      // FeedLine.is(msg).match(_ => ++lines);
      // FeedDone.is(msg).match(_ => console.log(lines));
      cld.is(msg, done);
    });
    bus.next(new CliArgs(tid, args));
  });

  it('--file', (done) => {
    const args = ['cli-test', '--file', 'test/git-history.sample'];
    const bus = new MsgBus();
    const tid = uuid.v4();
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    GitCommitProcessor.create(bus);
    ChangeLogProcessor.create(bus);
    const cld = new ChangeLogDefault();
    bus.subscribe(msg => {
      // console.log(msg.constructor.name);
      cld.is(msg, done);
    });
    bus.next(new CliArgs(tid, args));
  });

  it('--start text', (done) => {

    const args = ['--start', 'rb-LUX-start'];
    const bus = new MsgBus();
    const tid = uuid.v4();
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    GitCommitProcessor.create(bus);
    ChangeLogProcessor.create(bus);
    const cld = new ChangeLogDefault(/rb-LUX-start/);
    bus.subscribe(msg => {
      // console.log(`starting:`, msg.tid, msg.id, msg.constructor.name);
      GroupMsgDone.is(msg).match(({ groupMsg }) => {
        try {
          const gend = groupMsg;
          const storyGitCommits = Array.from(groupMsg.stories.stories.values());
          const send = storyGitCommits.length - 1;
          const gitCommits = storyGitCommits[send].gitCommits;
          assert.equal(gitCommits[gitCommits.length - 1].commit.sha, '34927334197b831f7fb62209d3b80ddea6bb777f');
        } catch (e) {
          done(e);
        }
      });
      cld.is(msg, done);
    });
    bus.next(new CliArgs(tid, args));
  });

  it('--start sha', (done) => {
    const args = ['--start', '34197b831f7fb622', '--no-story-sort-numeric'];
    const bus = new MsgBus();
    const tid = uuid.v4();
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    GitCommitProcessor.create(bus);
    ChangeLogProcessor.create(bus);
    const cld = new ChangeLogDefault(/34197b831f7fb622/);
    bus.subscribe(msg => {
      // console.log(`starting:`, msg.tid, msg.id, msg.constructor.name);
      GroupMsgDone.is(msg).match(({ groupMsg }) => {
        try {
          const gend = groupMsg;
          const storyGitCommits = Array.from(groupMsg.stories.stories.values());
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
    bus.next(new CliArgs(tid, args));
  });

  // it('default', (done) => {
  //   Cli.factory([]).subscribe(msg => {
  //     changeLogDefault(msg, done);
  //   });
  // });

});
