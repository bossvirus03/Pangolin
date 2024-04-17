import { join } from "path";

import * as fs from "fs";
import * as cache from "memory-cache";
import {
  IPangolinListenEvent,
  IPangolinRun,
} from "src/types/type.pangolin-handle";

export default class ExportCommand {
  static config = {
    name: "export", //your command name
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description: {
      vi: "",
      en: "",
    },
    guide: {
      vi: "",
      en: "",
    },
  };

  static message = {
    vi: {
      text1: "",
      text2: "",
    },
    en: {
      text1: "",
      text2: "",
    },
  };

  constructor(private client) {}
  async run({
    api,
    event,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
  }: IPangolinRun) {
    const folderPath = join(process.cwd(), "/src/modules/commands");
    // Read directory
    const files: any = await new Promise((resolve, reject) => {
      fs.readdir(folderPath, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });
    let msg = "";
    files.forEach((file, index) => {
      msg += `[${++index}]. ${file}\n`;
    });
    api.sendMessage(
      msg + "reply số tương ứng để lấy file",
      event.threadID,
      (err, info) => {
        if (err) console.log(err);
        else cache.put("messageID", info.messageID);
      },
      event.messageID,
    );
  }
  async event({
    api,
    event,
    client,
    UserData,
    ThreadData,
  }: IPangolinListenEvent) {
    const messageID = cache.get("messageID");
    if (event.type === "message_reply") {
      if (messageID && event.messageReply.messageID == messageID) {
        const folderPath = join(process.cwd(), "/src/modules/commands");
        // Read directory
        const files: any = await new Promise((resolve, reject) => {
          fs.readdir(folderPath, (err, files) => {
            if (err) reject(err);
            else resolve(files);
          });
        });
        files.forEach((file, index) => {
          if (++index == event.body) {
            const filePath = join(
              process.cwd(),
              "/src/modules/commands/" + file,
            );
            const fileContent = fs.readFileSync(filePath, "utf8");
            const pathOutput = join(
              process.cwd(),
              `/public/files/${file.split(".")[0]}.txt`,
            );
            fs.writeFileSync(pathOutput, fileContent),
              api.sendMessage(
                {
                  body: "success",
                  attachment: fs.createReadStream(pathOutput),
                },
                event.threadID,
                (err, info) => {
                  if (err) console.log(err);
                  else cache.put("messageID", info.messageID);
                },
                event.messageID,
              );
          }
        });
      }
    }
  }
}
