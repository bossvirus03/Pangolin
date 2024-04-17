import axios from "axios";

import * as fs from "fs";
import * as cache from "memory-cache";
import { join } from "path";
import {
  IPangolinListenEvent,
  IPangolinRun,
} from "src/types/type.pangolin-handle";
export default class SendAllCommand {
  static config = {
    name: "sendAll", //your command name
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    permission: 2,
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
      adminSend: "--------Admin Send--------\n\n message: $0",
      threadResponse:
        "--------Thread Response--------\n\nname: $0\ntid: $1\n\nmessage: $2",
    },
    en: {
      adminSend: "--------Admin Send--------\n\n message: $0",
      threadResponse:
        "--------Thread Response--------\n\nname: $0\ntid: $1\n\nmessage: $2",
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
    const sendAllPath = join(process.cwd(), "/src/db/data/sendAll.json");
    async function pushMessageID(ID) {
      let messageID = [ID];
      const previousID = fs.readFileSync(sendAllPath, "utf8");
      if (previousID) {
        const previousMessageIDArray = JSON.parse(previousID);
        const isDuplicate = previousMessageIDArray.some((id) => {
          return id == ID;
        });
        if (isDuplicate) {
          const newMessageID = previousMessageIDArray.map((id) => {
            if (id == ID) {
              return {
                id,
              };
            } else {
              return id;
            }
          });
          await fs.writeFileSync(sendAllPath, JSON.stringify(newMessageID), {
            encoding: "utf-8",
          });
        } else {
          const newMessageID = messageID.concat(previousMessageIDArray);
          await fs.writeFileSync(sendAllPath, JSON.stringify(newMessageID), {
            encoding: "utf-8",
          });
        }
      } else {
        fs.writeFileSync(sendAllPath, JSON.stringify(messageID), {
          encoding: "utf-8",
        });
      }
    }
    const msg = (event.body as string).split(args[0])[1].trim();
    const threadsData = await ThreadData.getAll();
    const threads = threadsData.map((item) => {
      return item.dataValues.tid;
    });
    const attachments = event?.messageReply?.attachments;
    const listAttachment = [];
    if (attachments) {
      const promises = attachments.map(async (item, index) => {
        const path = join(
          process.cwd(),
          `/public/images/${index}_sendAd_${event.senderID}.jpg`,
        );
        try {
          const response = await axios.get(item.url, {
            responseType: "arraybuffer",
          });
          const buffer = Buffer.from(response.data);
          fs.writeFileSync(path, buffer);
          listAttachment.push(fs.createReadStream(path));
        } catch (error) {
          console.error("Error downloading image:", error);
          return null;
        }
      });
      Promise.all(promises).then(async () => {
        threads.map((id) => {
          api.sendMessage(
            {
              body: getLang("adminSend", msg),
              attachment: listAttachment,
            },
            id,
            (err, info) => {
              if (err) console.log(err);
              else pushMessageID(info.messageID);
            },
          );
        });
      });
    } else {
      threads.map((id) => {
        api.sendMessage(
          {
            body: getLang("adminSend", msg),
          },
          id,
          (err, info) => {
            if (err) console.log(err);
            else pushMessageID(info.messageID);
          },
        );
      });
    }
  }
  async event({
    api,
    event,
    client,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
  }: IPangolinListenEvent) {
    const sendAllPath = join(process.cwd(), "/src/db/data/sendAll.json");
    const dataMessageID = fs.readFileSync(sendAllPath, "utf8");
    if (!dataMessageID) return;
    if (event.type === "message_reply") {
      const Tinfo: any = await new Promise((resolve, reject) => {
        api.getThreadInfo(event.threadID, (err, info) => {
          if (err) reject(err);
          else resolve(info);
        });
      });
      const messageIDs = JSON.parse(dataMessageID);
      messageIDs.forEach((messageID) => {
        if (event.messageReply.messageID === messageID) {
          const adminsData = process.env.ADMINS;
          const admins = JSON.parse(adminsData);
          admins.forEach((admin) => {
            api.sendMessage(
              getLang(
                "threadResponse",
                Tinfo.threadName,
                Tinfo.threadID,
                event.body,
              ),
              admin,
            );
          });
        }
      });
    }
  }
}
