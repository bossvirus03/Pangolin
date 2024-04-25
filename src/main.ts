import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app/app.module";
import { readFileSync } from "fs";
import { promisify } from "util";
import * as loginModule from "facebook-chat-api";
import { join } from "path";
import { ConfigService } from "@nestjs/config";
import { Logger, ValidationPipe } from "@nestjs/common";
import HandleCommand from "./core/handleCommand";
import HandleEvent from "./core/handleEvent";
import Listen from "./core/listen";
import { JwtAuthGuard } from "./app/auth/guards/jwt-auth.guard";
import cookieParser from "cookie-parser";
import { TransformInterceptor } from "./app/core/transform.interceptor";
import OnTime from "./modules/ontime";
import * as fs from "fs";
import { CustomLogger } from "src/logger/log";
import * as readlineSync from "readline-sync";

const Log = new CustomLogger();
const configPath = join(process.cwd(), "pangolin.config.json");
let dataConfig = fs.readFileSync(configPath, "utf8");
let config = JSON.parse(dataConfig);

function importInfoBot(callback) {
  const defaultName = "pangolin";
  const defaultPrefix = ";";
  const name = readlineSync.question(
    `YOUR BOT NAME:(${defaultName}) `.rainbow,
    {
      defaultInput: defaultName,
    },
  );
  const prefix = readlineSync.question(
    `YOUR PREFIX:(${defaultPrefix}) `.rainbow,
    {
      defaultInput: defaultPrefix,
    },
  );
  callback(name, prefix);
}

if (!config.botname || !config.prefix) {
  Log.info("Bạn chưa khởi tạo bot!");
  Log.info("Tiến hành nhập thông tin bot");
  importInfoBot((name, prefix) => {
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        ...config,
        botname: name,
        prefix: prefix,
      }),
      {
        encoding: "utf-8",
      },
    );
  });
}

// Assuming `login` is a function within the facebook-chat-api module
const login: Function = loginModule.default || loginModule;

async function bootstrap() {
  /** =========== APP ===========*/
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalGuards(new JwtAuthGuard(reflector));

  app.use(cookieParser());
  const port = configService.get("PORT") || 3000;
  await app.listen(port, () => {
    Logger.log(`🚀Application is running on: http://localhost:${port}`);
  });

  /**============ BOT ============= */
  try {
    const loginAsync = promisify(login);
    const loginPath = {
      appState: JSON.parse(
        readFileSync(
          join(
            process.cwd(),
            configService.get("FILE_STATE") || "appstate.json",
          ),
          "utf-8",
        ),
      ),
    };

    const client = {
      config: process.env,
      commands: new Map(),
      events: new Map(),
      noprefix: new Map(),
      onload: new Array(),
      handleEvent: new Map(),
      handleReply: new Map(),
      handleReaction: new Map(),
      language: new Object(),
    };

    global.client = {
      messageReply: new Array(),
      messageReaction: new Array(),
    };
    const LangData = (
      await readFileSync(
        join(process.cwd(), `/src/lang/${config.language || "en"}.lang`),
        "utf-8",
      ).split(/\r?\n|\r/)
    ).filter((item) => item && item.charAt(0) != "#");

    LangData.forEach((item) => {
      const splitItem = item.split("=");
      client.language[splitItem[0]] = splitItem[1];
    });

    global.getLang = function (...args: any[]) {
      const lang = client.language;
      if (!lang.hasOwnProperty(args[0])) console.log("Invalid language");
      let text = lang[args[0]];
      args.forEach((key, index) => {
        text = text.replace(`\$${index}`, args[index]);
      });
      return text.toString();
    };
    //load commands, event
    const loadCommands = new HandleCommand(client);
    const loadEvents = new HandleEvent(client);
    loadEvents.load();
    loadCommands.load();
    // Logging in to Facebook Chat API
    Log.rainbow(
      `
      ██████╗░░█████╗░███╗░░██╗░██████╗░░█████╗░██╗░░░░░██╗███╗░░██╗
      ██╔══██╗██╔══██╗████╗░██║██╔════╝░██╔══██╗██║░░░░░██║████╗░██║
      ██████╔╝███████║██╔██╗██║██║░░██╗░██║░░██║██║░░░░░██║██╔██╗██║
      ██╔═══╝░██╔══██║██║╚████║██║░░╚██╗██║░░██║██║░░░░░██║██║╚████║
      ██║░░░░░██║░░██║██║░╚███║╚██████╔╝╚█████╔╝███████╗██║██║░╚███║
      ╚═╝░░░░░╚═╝░░╚═╝╚═╝░░╚══╝░╚═════╝░░╚════╝░╚══════╝╚═╝╚═╝░░╚══╝`,
    );
    const P = ["\\", "|", "/", "-"];
    let x = 0;

    const loader = setInterval(() => {
      process.stdout.write(`\rĐang tiến hành đăng nhập ${P[x++]}`);
      x %= P.length;
    }, 200);

    try {
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 3000);
      });
      clearInterval(loader);
      process.stdout.write("\n");
      await loginAsync(loginPath, async (err, api) => {
        if (err) {
          console.error("Error during login:", err);
          return;
        }
        const currentUserID = await api.getCurrentUserID();
        async function checkCurrentUserID(currentUserID) {
          const pathCurrentUserID = join(
            process.cwd(),
            "src/db/data/currentUserID.json",
          );
          const savedCurrentUserID = fs.readFileSync(pathCurrentUserID, "utf8");
          if (!savedCurrentUserID) {
            fs.writeFileSync(
              pathCurrentUserID,
              JSON.stringify({ currentUserID: currentUserID }),
            );
          }
          if (savedCurrentUserID) {
            if (JSON.parse(savedCurrentUserID).currentUserID != currentUserID) {
              Log.warn(
                "Bạn đang chạy bot với account mới...\nVui lòng xoá file database.sqlite để cập nhật lại dữ liệu",
              );
              await new Promise((resolve, reject) => {
                setTimeout(resolve, 3000);
              });
              process.stdout.write("\n");
              fs.writeFileSync(
                pathCurrentUserID,
                JSON.stringify({ currentUserID: currentUserID }),
              );
            }
          }
        }
        checkCurrentUserID(currentUserID);

        Log.rainbow("Login Successfully ");
        dataConfig = fs.readFileSync(configPath, "utf8");
        config = JSON.parse(dataConfig);
        console.table([
          {
            PREFIX: config.prefix,
            UID: currentUserID,
          },
        ]);
        // Lắng nghe sự kiện
        const ListenEvent = new Listen(api, client);
        ListenEvent.listen();

        // Schedule tasks
        const schedulerService = app.get(OnTime);
        schedulerService.scheduleTask(api);
      });
    } catch (error) {
      clearInterval(loader);
      console.error("Error during login:", error);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

bootstrap();
