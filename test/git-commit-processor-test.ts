import * as uuid from 'uuid';
import { assert } from 'chai';
import { CliProcessor } from '../src/processors/cli-processor';
import { MsgBus } from '../src/msg-bus';
import { CliArgs } from '../src/msg/cli-args';
import { CliConfig } from '../src/msg/cli-config';
import { StreamProcessor } from '../src/processors/stream-processor';
import { GitHistoryError } from '../src/msg/git-history-error';
import { GitHistoryMsg } from '../src/msg/git-history-msg';
import { StreamDone } from '../src/msg/stream-done';
import { StreamData } from '../src/msg/stream-data';
import { LineProcessor } from '../src/processors/line-processor';
import { LineLine } from '../src/msg/line-line';
import { LineDone } from '../src/msg/line-done';
import { GitCommitProcessor } from '../src/processors/git-commit-processor';
import { GitCommit } from '../src/msg/git-commit';
import { GitCommitOpen } from '../src/msg/git-commit-open';
import { GitCommitDone } from '../src/msg/git-commit-done';

describe('git-commit-processor', () => {

  it('exec-read', (done) => {
    const tid = uuid.v4();
    const bus = new MsgBus();
    const cliProc = new CliProcessor(bus);
    const streamProc = new StreamProcessor(bus);
    const lineProc = new LineProcessor(bus);
    const gitProc = new GitCommitProcessor(bus);
    const msgs: GitHistoryMsg[] = [];
    const datas: GitCommit[] = [];
    const multiple = 100;
    bus.subscribe(msg => {
      if (!(['StreamData', 'LineLine'].find(i => i == msg.type))) {
        msgs.push(msg);
      }
      GitCommit.is(msg).hasTid(tid).match(data => {
        datas.push(data);
      });
      GitCommitDone.is(msg).hasTid(tid).match(err => {
        try {
          assert.deepEqual(msgs.map(i => i.type).reduce((p, i) => {
            if (i != p[p.length - 1]) {
              p.push(i);
            }
            return p;
          }, []), [
            'CliArgs',
            'GitCommitOpen',
            'LineOpen',
            'StreamOpen',
            'CliConfig',
            'GitCommit',
            'StreamDone',
            'GitCommit',
            'GitCommitDone'
          ]);
          assert.equal(datas.length, 14 * multiple);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    bus.next(new CliArgs(tid, ['x', 'y', '--git-cmd', 'cat', '--git-options',
      (new Array(multiple)).fill('test/git-history.sample').join(' ')
    ]));
  });

  it('file-read', (done) => {
    const tid = uuid.v4();
    const bus = new MsgBus();
    const cliProc = new CliProcessor(bus);
    const streamProc = new StreamProcessor(bus);
    const lineProc = new LineProcessor(bus);
    const gitProc = new GitCommitProcessor(bus);
    const msgs: GitHistoryMsg[] = [];
    const datas: GitCommit[] = [];
    bus.subscribe(msg => {
      if (!(['StreamData', 'LineLine'].find(i => i == msg.type))) {
        msgs.push(msg);
      }
      GitCommit.is(msg).hasTid(tid).match(data => {
        datas.push(data);
      });
      GitCommitDone.is(msg).hasTid(tid).match(err => {
        try {
          assert.deepEqual(msgs.map(i => i.type), [
            'CliArgs',
            'GitCommitOpen',
            'LineOpen',
            'StreamOpen',
            'CliConfig',
            'GitCommit',
            'GitCommit',
            'GitCommit',
            'GitCommit',
            'GitCommit',
            'GitCommit',
            'GitCommit',
            'GitCommit',
            'GitCommit',
            'GitCommit',
            'GitCommit',
            'GitCommit',
            'GitCommit',
            'StreamDone',
            'GitCommit',
            'GitCommitDone'
          ]);
          assert.equal(datas.length, 14);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    bus.next(new CliArgs(tid, ['x', 'y', '--file', 'test/git-history.sample']));
  });

  it('file-empty-file', (done) => {
    const tid = uuid.v4();
    const bus = new MsgBus();
    const cliProc = new CliProcessor(bus);
    const streamProc = new StreamProcessor(bus);
    const lineProc = new LineProcessor(bus);
    const gitProc = new GitCommitProcessor(bus);
    const msgs: GitHistoryMsg[] = [];
    bus.subscribe(msg => {
      msgs.push(msg);
      GitHistoryError.is(msg).match(err => {
        done(err);
      });
      GitCommitDone.is(msg).hasTid(tid).match(err => {
        try {
          assert.deepEqual(msgs.map(i => i.type), [
            'CliArgs',
            'GitCommitOpen',
            'LineOpen',
            'StreamOpen',
            'CliConfig',
            'StreamDone',
            'GitCommitDone'
          ]);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    bus.next(new CliArgs(tid, ['x', 'y', '--file', 'test/empty-file.sample']));
  });

});
