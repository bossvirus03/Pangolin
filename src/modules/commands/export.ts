import { join } from "path";
import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import * as fs from "fs";
import * as cache from "memory-cache";

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
  async run(
    api: Ifca,
    event: IEvent,
    client,
    args,
    DataUser,
    DataThread,
    UserInThreadData,
    getLang
  ) {
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
      event.messageID
    );
  }
  async event(api: Ifca, event: IEvent, client, DataUser, DataThread) {
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
              "/src/modules/commands/" + file
            );
            const fileContent = fs.readFileSync(filePath, "utf8");
            const pathOutput = join(
              process.cwd(),
              `/public/files/${file.split(".")[0]}.txt`
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
                event.messageID
              );
          }
        });
      }
    }
  }
}
