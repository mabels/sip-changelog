import * as uuid from 'uuid';
import * as streamBuffers from 'stream-buffers';
import { assert } from 'chai';

import { MsgBus } from '../src/msg-bus';
import { CliProcessor } from '../src/processors/cli-processor';
import { StreamProcessor } from '../src/processors/stream-processor';
import { LineProcessor } from '../src/processors/line-processor';
import { GitCommitProcessor } from '../src/processors/git-commit-processor';
import { ChangeLogProcessor } from '../src/processors/change-log-processor';
import { OutputProcessor } from '../src/processors/output-processor';
import { CliArgs } from '../src/msg/cli-args';
import { ConfigStreamOutputMsg } from '../src/msg/config-stream-output-msg';
import { ChangeLogDone } from '../src/msg/change-log-done';
import { doesNotReject } from 'assert';
import { ConfigStreamOutputDone } from '../src/msg/config-stream-output-done';
import * as jsdom from 'jsdom';

interface StartApp {
  bus: MsgBus;
  stdout: streamBuffers.WritableStreamBuffer;
  stderr: streamBuffers.WritableStreamBuffer;
}

function startApp(args: string[]): StartApp {
  const bus = new MsgBus();
  const tid = uuid.v4();
  CliProcessor.create(bus);
  StreamProcessor.create(bus);
  LineProcessor.create(bus);
  GitCommitProcessor.create(bus);
  ChangeLogProcessor.create(bus);
  OutputProcessor.create(bus);
  const stdout = new streamBuffers.WritableStreamBuffer();
  const stderr = new streamBuffers.WritableStreamBuffer();
  bus.next(new ConfigStreamOutputMsg(tid, stdout, stderr));
  bus.next(new CliArgs(tid, args));
  return { bus, stdout, stderr };
}

describe('output-process-test', () => {
  it('text-processor', (done) => {
    const app = startApp(['--text', '--story-match', 'WIP', '--group-by-tag', 'dt-(.*)']);
    app.bus.subscribe(msg => {
      ChangeLogDone.is(msg).match(cld => {
        try {
          assert.equal(app.stderr.getContentsAsString('utf8'), '', 'stderr');
          const out = app.stdout.getContentsAsString('utf8');
          assert.isOk(out.includes('\ndt-lux-4\n'), 'first');
          assert.isOk(out.includes('\n\tWIP\n'), 'second');
          assert.isOk(out.includes('\n\t\t* WIP\n'), 'third');
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  it('json-processor', (done) => {
    const app = startApp(['--json', '--story-match', 'WIP', '--group-by-tag', 'dt-(.*)']);
    app.bus.subscribe(msg => {
      ConfigStreamOutputDone.is(msg).match(cld => {
        try {
          assert.equal(app.stderr.getContentsAsString('utf8'), '', 'stderr');
          const jsStr = app.stdout.getContentsAsString('utf8');
          const out = JSON.parse(jsStr);
          const dtLux4 = out.find((i: any) => i.names[0] === 'dt-lux-4');
          assert.isOk(dtLux4);
          const wip = dtLux4.stories.find((i: any) => i.name === 'WIP');
          assert.isOk(wip);
          // console.log(wip.commits.map((c: any) => c.message));
          assert.isOk(wip.commits.find((c: any) => c.message.find((i: any) => i.includes('WIP'))));
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  it('html-processor', (done) => {
    const app = startApp(['--html', '--story-match', 'WIP', '--group-by-tag', 'dt-(.*)']);
    app.bus.subscribe(msg => {
      ConfigStreamOutputDone.is(msg).match(cld => {
        try {
          const document = new jsdom.JSDOM(app.stdout.getContentsAsString('utf8')).window.document;
          assert.equal(app.stderr.getContentsAsString('utf8'), '', 'stderr');

          assert.equal(Array.from(document.querySelectorAll('.groupMsg .names .name').values())
             .find(i => i.innerHTML === 'dt-lux-4').innerHTML, 'dt-lux-4');

          assert.equal(Array.from(document.querySelectorAll('.groupMsg .stories .story .name').values())
             .find(i => i.innerHTML === 'WIP').innerHTML, 'WIP');

          assert.equal(Array.from(
            document.querySelectorAll('.groupMsg .stories .story .commits .commit .message pre').values())
             .find(i => i.innerHTML === 'WIP').innerHTML, 'WIP');
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  it('markdown-processor', (done) => {
    const app = startApp(['--markdown', '--story-match', 'WIP', '--group-by-tag', 'dt-(.*)']);
    app.bus.subscribe(msg => {
      ConfigStreamOutputDone.is(msg).match(cld => {
        try {
          assert.equal(app.stderr.getContentsAsString('utf8'), '', 'stderr');
          const out = app.stdout.getContentsAsString('utf8');
          assert.isOk(out.includes('\n* dt-lux-4\n'), 'first');
          assert.isOk(out.includes('\n\t* WIP\n'), 'second');
          assert.isOk(out.includes('\n\t\t* <code>WIP</code>\n'), 'third');
          done();
        } catch (e) {
          console.error(e);
          done(e);
        }
      });
    });
  });

});
