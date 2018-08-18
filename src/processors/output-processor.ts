
import { MsgBus } from '../msg-bus';
import { GroupMsgDone } from '../msg/group-msg-done';
import { CliConfig, CliConfigOutputFormat } from '../msg/cli-config';
import { HtmlOutputProcessor } from './html-output-processor';
import { JsonOutputProcessor } from './json-output-processor';
import { MarkdownOutputProcessor } from './markdown-output-processor';
import { TextOutputProcessor } from './text-output-processor';
import { ConfigStreamOutputMsg } from '../msg/config-stream-output-msg';
import { ChangeLogDone } from '../msg/change-log-done';
import { ConfigStreamOutputDone } from '../msg/config-stream-output-done';

export interface Stopable {
  stop(): void;
}

export class OutputProcessor {

  public outputProcessor?: Stopable;

  public output?: ConfigStreamOutputMsg;

  public cliConfigs: CliConfig[] = [];

  public static create(msgBus: MsgBus): OutputProcessor {
    return new OutputProcessor(msgBus);
  }

  private constructor(msgBus: MsgBus) {
    msgBus.subscribe(msg => {
      ConfigStreamOutputMsg.is(msg).match(output => {
        this.output = output;
        this.output.sout.write('');
        this.output.serr.write('');
      });
      ConfigStreamOutputDone.is(msg).match(csod => {
        if (process.stdout !== this.output.sout) {
          this.output.sout.end();
        }
        if (process.stderr !== this.output.serr) {
          this.output.serr.end();
        }
      });
      CliConfig.is(msg).match(config => {
        // console.log(`hallo`, config);
        if (this.outputProcessor) {
          this.outputProcessor.stop();
        }
        switch (config.outputFormat) {
          case CliConfigOutputFormat.html:
            this.outputProcessor = HtmlOutputProcessor.create(msgBus, this.output);
            break;
          case CliConfigOutputFormat.json:
            this.outputProcessor = JsonOutputProcessor.create(msgBus, this.output);
            break;
          case CliConfigOutputFormat.markdown:
            this.outputProcessor = MarkdownOutputProcessor.create(msgBus, this.output);
            break;
          case CliConfigOutputFormat.text:
          default:
            this.outputProcessor = TextOutputProcessor.create(msgBus, this.output);
            break;
        }
      });
    });
  }

}
