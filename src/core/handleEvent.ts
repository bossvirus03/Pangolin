import { Logger } from "@nestjs/common";
import { readdirSync } from "fs";
import { join } from "path";
import * as tsNode from "ts-node";

class HandleEvent {
  constructor(private client: any) {}

  load() {
    const eventPath = join(process.cwd(), "src", "modules", "events");

    // Configure ts-node to transpile TypeScript files on the fly
    tsNode.register({
      transpileOnly: true,
    });

    const eventFiles = readdirSync(eventPath).filter((file: string) =>
      file.endsWith(".ts")
    );
    eventFiles.forEach((file) => {
      const logger = new Logger(); // Create an instance of the Logger
      logger.log(`Loaded event file: {${file}}`);
    });

    let eventCount = 0;
    for (const file of eventFiles) {
      try {
        const filePath = join(eventPath, file);
        const eventClass = require(filePath).default;

        if (!eventClass || !eventClass.config) {
          console.error(
            `Error loading event from file ${file}: Invalid event structure`
          );
          continue;
        }

        const { config } = eventClass;

        if (!config || !config.name) {
          console.error(
            `Error loading event from file ${file}: event name is undefined`
          );
          continue;
        }

        const eventInstance = new eventClass(this.client);
        if (eventInstance.run) {
          eventCount++;
          this.client.events.set(config.name, eventInstance);
        }

        if (eventInstance.onload) {
          this.client.onload.push(eventInstance);
        }
      } catch (error) {
        console.error(`Error loading event from file ${file}:`, error);
      }
    }

    console.log(`Loaded ${eventCount} event!`);
  }
}

export default HandleEvent;
