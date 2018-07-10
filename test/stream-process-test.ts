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

describe('stream-processor', () => {

  it('exec-error', (done) => {
    const tid = uuid.v4();
    const bus = new MsgBus();
    const cliProc = new CliProcessor(bus);
    const streamProc = new StreamProcessor(bus);
    const msgs: GitHistoryMsg[] = [];
    bus.subscribe(msg => {
      msgs.push(msg);
      GitHistoryError.is(msg).hasTid(tid).match(err => {
        try {
          assert.equal(err.error.message,
            ['Command failed: /bin/sh -c "real-unknown-executable" log --format=raw --decorate=full',
              '/bin/sh: real-unknown-executable: command not found',
              '', ''].join('\n'));
          assert.deepEqual(msgs.map(i => i.type), [
            'CliArgs',
            'StreamOpen',
            'CliConfig',
            'StreamDone',
            'GitHistoryError'
          ]);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    bus.next(new CliArgs(tid, ['x', 'y', '--git-cmd', 'real-unknown-executable']));
  });

  it('file-not-found-error', (done) => {
    const tid = uuid.v4();
    const bus = new MsgBus();
    const cliProc = new CliProcessor(bus);
    const streamProc = new StreamProcessor(bus);
    const msgs: GitHistoryMsg[] = [];
    bus.subscribe(msg => {
      msgs.push(msg);
      GitHistoryError.is(msg).hasTid(tid).match(err => {
        try {
          assert.equal(err.error.message,
            ['ENOENT: no such file or directory, open \'real-unknown-executable\''].join('\n'));
          assert.deepEqual(msgs.map(i => i.type), [
            'CliArgs',
            'StreamOpen',
            'CliConfig',
            'GitHistoryError'
          ]);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    bus.next(new CliArgs(tid, ['x', 'y', '--file', 'real-unknown-executable']));
  });

  it('exec-read', (done) => {
    const tid = uuid.v4();
    const bus = new MsgBus();
    const cliProc = new CliProcessor(bus);
    const streamProc = new StreamProcessor(bus);
    const msgs: GitHistoryMsg[] = [];
    const datas: string[] = [];
    const multiple = 100;
    bus.subscribe(msg => {
      msgs.push(msg);
      StreamData.is(msg).hasTid(tid).match(data => {
        datas.push(data.data);
      });
      StreamDone.is(msg).hasTid(tid).match(err => {
        try {
          assert.deepEqual(msgs.map(i => i.type).reduce((p, i) => {
            if (i != p[p.length - 1]) {
              p.push(i);
            }
            return p;
          }, []), [
              'CliArgs',
              'StreamOpen',
              'CliConfig',
              'StreamData',
              'StreamDone'
            ]);
          assert.equal(datas.join('').length, 16963 * multiple);
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
    const msgs: GitHistoryMsg[] = [];
    const datas: string[] = [];
    bus.subscribe(msg => {
      msgs.push(msg);
      StreamData.is(msg).hasTid(tid).match(data => {
        datas.push(data.data);
      });
      StreamDone.is(msg).hasTid(tid).match(err => {
        try {
          assert.deepEqual(msgs.map(i => i.type), [
            'CliArgs',
            'StreamOpen',
            'CliConfig',
            'StreamData',
            'StreamDone'
          ]);
          assert.equal(datas.join('').length, 16963);
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
    const msgs: GitHistoryMsg[] = [];
    bus.subscribe(msg => {
      msgs.push(msg);
      StreamDone.is(msg).hasTid(tid).match(err => {
        try {
          assert.deepEqual(msgs.map(i => i.type), [
            'CliArgs',
            'StreamOpen',
            'CliConfig',
            'StreamDone'
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
