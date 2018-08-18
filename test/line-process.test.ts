import * as uuid from 'uuid';
import { assert } from 'chai';
import { CliProcessor } from '../src/processors/cli-processor';
import { MsgBus } from '../src/msg-bus';
import { CliArgs } from '../src/msg/cli-args';
// import { CliConfig } from '../src/msg/cli-config';
import { StreamProcessor } from '../src/processors/stream-processor';
import { GitHistoryError } from '../src/msg/git-history-error';
import { GitHistoryMsg } from '../src/msg/git-history-msg';
// import { StreamDone } from '../src/msg/stream-done';
// import { StreamData } from '../src/msg/stream-data';
import { LineProcessor } from '../src/processors/line-processor';
import { LineLine } from '../src/msg/line-line';
import { LineDone } from '../src/msg/line-done';

describe('line-processor', () => {

  it('exec-error', (done) => {
    const tid = uuid.v4();
    const bus = new MsgBus();
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    const msgs: GitHistoryMsg[] = [];
    bus.subscribe(msg => {
      msgs.push(msg);
      GitHistoryError.is(msg).hasTid(tid).match(err => {
        try {
          assert.isOk(err.error.message.includes('real-unknown-executable'));
          assert.isOk(err.error.message.includes('not found'));
          // console.log(err.error);
          // assert.equal(err.error.message,
          //   ['Command failed: /bin/sh -c "real-unknown-executable" log --format=raw --decorate=full',
          //     '/bin/sh: real-unknown-executable: command not found',
          //     '', ''].join('\n'));
          assert.deepEqual(msgs.map(i => i.type), [
            'CliArgs',
            'LineOpen',
            'StreamOpen',
            'CliConfig',
            'StreamDone',
            'LineDone',
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
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    const msgs: GitHistoryMsg[] = [];
    bus.subscribe(msg => {
      msgs.push(msg);
      GitHistoryError.is(msg).hasTid(tid).match(err => {
        try {
          assert.equal(err.error.message,
            ['ENOENT: no such file or directory, open \'real-unknown-executable\''].join('\n'));
          assert.deepEqual(msgs.map(i => i.type), [
            'CliArgs',
            'LineOpen',
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
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    const msgs: GitHistoryMsg[] = [];
    const datas: string[] = [];
    const multiple = 100;
    bus.subscribe(msg => {
      if (msg.type != 'StreamData') { msgs.push(msg); }
      LineLine.is(msg).hasTid(tid).match(data => {
        datas.push(data.line);
      });
      LineDone.is(msg).hasTid(tid).match(err => {
        try {
          assert.deepEqual(msgs.map(i => i.type).reduce((p, i) => {
            if (i != p[p.length - 1]) {
              p.push(i);
            }
            return p;
          }, []), [
              'CliArgs',
              'LineOpen',
              'StreamOpen',
              'CliConfig',
              'LineLine',
              'StreamDone',
              'LineDone'
            ]);
          assert.equal(datas.join('\n').length + '\n'.length, 16963 * multiple);
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
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    const msgs: GitHistoryMsg[] = [];
    const datas: string[] = [];
    bus.subscribe(msg => {
      msgs.push(msg);
      LineLine.is(msg).hasTid(tid).match(data => {
        datas.push(data.line);
      });
      LineDone.is(msg).hasTid(tid).match(err => {
        try {
          assert.deepEqual(msgs.map(i => i.type), [
            'CliArgs',
            'LineOpen',
            'StreamOpen',
            'CliConfig',
            ...(new Array(354)).fill('LineLine'),
            'StreamData',
            'StreamDone',
            'LineDone'
          ]);
          assert.equal(datas.join('\n').length + '\n'.length, 16963);
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
    CliProcessor.create(bus);
    StreamProcessor.create(bus);
    LineProcessor.create(bus);
    const msgs: GitHistoryMsg[] = [];
    bus.subscribe(msg => {
      msgs.push(msg);
      LineDone.is(msg).hasTid(tid).match(err => {
        try {
          assert.deepEqual(msgs.map(i => i.type), [
            'CliArgs',
            'LineOpen',
            'StreamOpen',
            'CliConfig',
            'StreamDone',
            'LineDone'
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
