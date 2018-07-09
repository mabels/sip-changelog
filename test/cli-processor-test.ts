import * as uuid from 'uuid';
import { assert } from 'chai';
import { CliProcessor } from '../src/processors/cli-processor';
import { MsgBus } from '../src/msg-bus';
import { CliArgs } from '../src/msg/cli-args';
import { CliConfig } from '../src/msg/cli-config';

describe('cli-processor', () => {

  it.only('cli-empty', (done) => {
    const tid = uuid.v4();
    const bus = new MsgBus();
    const processor = new CliProcessor(bus);

    bus.subscribe(msg => {
      CliConfig.is(msg).match(cliConfig => {
        try {
          assert.equal(tid, cliConfig.tid);
          assert.equal(cliConfig.start.toString(), '/will@never@ever@matched/');
          assert.deepEqual(cliConfig.storyMatches, [
            {
              flag: 'i',
              regExp: /(?:)/i
            }
          ]);
          assert.deepEqual(cliConfig.groupByTags, []);
          assert.equal(cliConfig.config.gitCmd, 'git');
          assert.equal(cliConfig.config.file, undefined);
          assert.equal(cliConfig.config.gitOptions, 'log --format=raw --decorate=full');
          assert.equal(cliConfig.config.omitExcerpt, true);
          assert.equal(cliConfig.config.storySortNumeric, true);
          assert.equal(cliConfig.config.text, false);
          assert.equal(cliConfig.config.html, false);
          assert.equal(cliConfig.config.json, false);
          assert.equal(cliConfig.config.markdown, false);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    bus.next(new CliArgs(tid, ['x', 'y']));
  });

  it.only('cli fulloptions', (done) => {
    const tid = uuid.v4();
    const bus = new MsgBus();
    const processor = new CliProcessor(bus);

    bus.subscribe(msg => {
      CliConfig.is(msg).match(cliConfig => {
        try {
          assert.equal(tid, cliConfig.tid);
          assert.equal(cliConfig.start.toString(), '/meno/');
          assert.deepEqual(cliConfig.storyMatches, [
              {
                flag: 'g',
                regExp: /sm1/g
              }, {
                flag: 'i',
                regExp: /sm2/i
              }, {
                flag: 'i',
                regExp: /sm3/i
              }
            ]);
          assert.deepEqual(cliConfig.groupByTags, [
                {
                  flag: 'i',
                  regExp: /tag1/i
                }, {
                  flag: 'g',
                  regExp: /tag2/g
                }, {
                  flag: 'i',
                  regExp: /tag3/i
                }
              ]);
          assert.equal(cliConfig.config.gitCmd, 'git-cmd');
          assert.equal(cliConfig.config.file, 'test-file');
          assert.equal(cliConfig.config.gitOptions, 'git-options');
          assert.equal(cliConfig.config.omitExcerpt, false);
          assert.equal(cliConfig.config.storySortNumeric, false);
          assert.equal(cliConfig.config.text, true);
          assert.equal(cliConfig.config.html, true);
          assert.equal(cliConfig.config.json, true);
          assert.equal(cliConfig.config.markdown, true);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
    bus.next(new CliArgs(tid, ['x', 'y',
      '--start', 'meno',
      '--story-match', 'sm1',
      '--story-match', 'sm2',
      '--story-match-regex-flag', 'g',
      '--story-match', 'sm3',

      '--group-by-tag', 'tag1',
      '--group-by-tag-regex-flag', 'i',
      '--group-by-tag', 'tag2',
      '--group-by-tag-regex-flag', 'g',
      '--group-by-tag', 'tag3',

      '--no-story-sort-numeric',
      '--no-omit-excerpt',

      '--file', 'test-file',
      '--git-cmd', 'git-cmd',
      '--git-options', 'git-options',

      '--text',
      '--json',
      '--html',
      '--markdown']));

  });

});
