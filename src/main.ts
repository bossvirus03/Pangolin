import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { readFileSync } from "fs";
import { promisify } from "util";
import * as loginModule from "facebook-chat-api";
import { join } from "path";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import HandleCommand from "./core/handleCommand";
import HandleEvent from "./core/handleEvent";
import Listen from "./core/listen";

// Assuming `login` is a function within the facebook-chat-api module
const login: Function = loginModule.default || loginModule;

async function bootstrap() {
  /** =========== APP ===========*/
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get("PORT") || 3000;
  await app.listen(port, () => {
    Logger.log(`🚀Application is running on: http://localhost:${port}`);
  });

  /**============ BOT ============= */
  // Using promisify to convert the callback-based login function to Promise-based
  const loginAsync = promisify(login);
  try {
    const loginPath = {
      appState: JSON.parse(
        readFileSync(
          join(process.cwd(), configService.get("FILE_STATE")),
          "utf-8"
        )
      ),
    };

    const client = {
      config: process.env,
      commands: new Map(),
      events: new Map(),
      noprefix: new Map(),
      onload: new Array(),
      event: new Map(),
    };

    //load commands, event
    const loadCommands = new HandleCommand(client);
    const loadEvents = new HandleEvent(client);
    loadEvents.load();
    loadCommands.load();

    // Logging in to Facebook Chat API
    await loginAsync(loginPath, (err, api) => {
      if (err) return console.error(err);

      //listen event
      const ListenEvent = new Listen(api, client);
      ListenEvent.listen();
    });

    // Starting the application after successful login
    console.log("Application is listening on port 3000");
  } catch (error) {
    console.error("Error during login:", error);
    // Handle login error
  }
}

bootstrap();
