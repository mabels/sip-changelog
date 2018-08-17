
import { MsgBus } from '../msg-bus';
import { GroupMsgDone } from '../msg/group-msg-done';
import { CliConfig, CliConfigOutputFormat } from '../msg/cli-config';
import { HtmlOutputProcessor } from './html-output-processor';
import { JsonOutputProcessor } from './json-output-processor';
import { MarkdownOutputProcessor } from './markdown-output-processor';
import { TextOutputProcessor } from './text-output-processor';
import { ConfigStreamOutputMsg } from '../msg/config-stream-output-msg';

export interface Stopable {
  stop(): void;
}

export class OutputProcessor {

  public outputProcessor?: Stopable;

  public output: ConfigStreamOutputMsg;

  public cliConfigs: CliConfig[] = [];

  public static create(msgBus: MsgBus): OutputProcessor {
    return new OutputProcessor(msgBus);
  }

  private constructor(msgBus: MsgBus) {
    msgBus.subscribe(msg => {
      ConfigStreamOutputMsg.is(msg).match(output => {
        this.output = output;
      });
      CliConfig.is(msg).match(config => {
        // console.log(`hallo`, config);
        if (this.outputProcessor) {
          this.outputProcessor.stop();
        }
        switch (config.outputFormat) {
          case CliConfigOutputFormat.html:
            this.outputProcessor = HtmlOutputProcessor.create(msgBus);
            break;
          case CliConfigOutputFormat.json:
            this.outputProcessor = JsonOutputProcessor.create(msgBus);
            break;
          case CliConfigOutputFormat.markdown:
            this.outputProcessor = MarkdownOutputProcessor.create(msgBus);
            break;
          case CliConfigOutputFormat.text:
          default:
            this.outputProcessor = TextOutputProcessor.create(msgBus);
            break;
        }
      });
    });
  }

}
