import { join } from "path";
import * as fs from "fs";

import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class WarnCommand {
  static config = {
    name: "warn",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description:
      "Cách dùng: [prefix]warn [@mentions or reply tin nhắn người cần warn]\nChức năng: cảnh báo ",
    permission: 1,
  };

  constructor(private client) {}

  async run({ api, event, client, args }: IPangolinRun) {
    if (event.type === "message_reply" && event.mentions) {
      return api.sendMessage(
        "Chỉ reply hoặc chỉ tag user cần warn!",
        event.threadID,
      );
    }
    const pathDataWarn = join(process.cwd(), "/src/db/data/warn.json");
    async function delDataWarn(warnedId) {
      const previousWarn = fs.readFileSync(pathDataWarn, "utf8");
      const previousWarnArray = JSON.parse(previousWarn);
      const newDataWarn = previousWarnArray.filter(
        (item) => item.warnedId != warnedId,
      );
      await fs.writeFileSync(pathDataWarn, JSON.stringify(newDataWarn), {
        encoding: "utf-8",
      });
    }
    async function handleWarning(warnedId, reason) {
      let warnUser = [
        {
          warnedId: warnedId,
          reason: [reason],
        },
      ];
      const previousWarn = fs.readFileSync(pathDataWarn, "utf8");
      if (previousWarn) {
        const previousWarnArray = JSON.parse(previousWarn);
        const isDuplicate = previousWarnArray.some((item) => {
          return item.warnedId == warnedId;
        });
        if (isDuplicate) {
          const newWarnUser = previousWarnArray.map((item) => {
            if (item.warnedId == warnedId) {
              return {
                warnedId: item.warnedId,
                reason: [...item.reason, reason],
              };
            } else {
              return item;
            }
          });
          await fs.writeFileSync(pathDataWarn, JSON.stringify(newWarnUser), {
            encoding: "utf-8",
          });
        } else {
          const newWarnUser = warnUser.concat(previousWarnArray);
          await fs.writeFileSync(pathDataWarn, JSON.stringify(newWarnUser), {
            encoding: "utf-8",
          });
        }
      } else {
        fs.writeFileSync(pathDataWarn, JSON.stringify(warnUser), {
          encoding: "utf-8",
        });
      }
      api.sendMessage(
        `Đã warn thành công user ${warnedId} với lí do: ${reason}`,
        event.threadID,
      );
    }
    if (event.type === "message_reply") {
      const warnedId = event.messageReply.senderID;
      const info = await api.getUserInfo(warnedId, (err, ret) => {
        if (err) return console.log(err);
      });
      const reason = (event.body as string).split(args[0])[1].trim();
      if (!reason)
        return api.sendMessage("Vui lòng viết lí do warn!", event.threadID);
      await handleWarning(warnedId, reason);
      const previousWarn = fs.readFileSync(pathDataWarn, "utf8");
      JSON.parse(previousWarn).forEach((item) => {
        if (item.warnedId == warnedId) {
          if (item.reason.length == 3) {
            let i = 1;
            api.sendMessage(
              {
                body: `${info[warnedId].name} bạn đã bị báo cảnh báo 3 lần: ${item.reason.map(
                  (item) => {
                    return `\n${i++}. ${item}`;
                  },
                )} \nBạn còn 1 lần nữa là sẽ bị kick khỏi nhóm!`,
                mentions: [
                  {
                    tag: info[warnedId].name,
                    id: warnedId,
                  },
                ],
              },
              event.threadID,
            );
          }
          if (item.reason.length == 4) {
            let i = 1;
            api.sendMessage(
              `Bạn đã bị báo cảnh báo 4 lần! Good bye...`,
              event.threadID,
            );
            api.removeUserFromGroup(warnedId, event.threadID);
            delDataWarn(warnedId);
          }
        }
      });
    }
    if (!args[1] || !event.mentions)
      return api.sendMessage(
        "Vui lòng tag một người! hoặc reply tin nhắn của người cần warn",
        event.threadID,
      );
    const reason = (event.body as string).split(
      Object.values(event.mentions)[0] as string,
    )[1];
    if (!reason)
      return api.sendMessage("Vui lòng viết lí do warn!", event.threadID);
    if (event.mentions) {
      if ((Object.entries(event.mentions).length as number) == 1) {
        const warnedId = Object.entries(event.mentions).map((item) => {
          return item[0];
        });
        const info = await api.getUserInfo(warnedId[0], (err, ret) => {
          if (err) return console.log(err);
        });
        const reason = (event.body as string)
          .split(Object.values(event.mentions)[0] as string)[1]
          .trim();
        if (!reason)
          return api.sendMessage("Vui lòng viết lí do warn!", event.threadID);
        await handleWarning(warnedId[0], reason);
        const previousWarn = fs.readFileSync(pathDataWarn, "utf8");
        JSON.parse(previousWarn).forEach((item) => {
          if (item.warnedId == warnedId[0]) {
            if (item.reason.length == 3) {
              let i = 1;
              api.sendMessage(
                {
                  body: `${info[warnedId[0]].name} bạn đã bị báo cảnh báo 3 lần: ${item.reason.map(
                    (item) => {
                      return `\n${i++}. ${item}`;
                    },
                  )} \nBạn còn 1 lần nữa là sẽ bị kick khỏi nhóm!`,
                  mentions: [
                    {
                      tag: info[warnedId[0]].name,
                      id: warnedId,
                    },
                  ],
                },
                event.threadID,
              );
            }
            console.log(item.reason);
            if (item.reason.length == 4) {
              let i = 1;
              api.sendMessage(
                `Bạn đã bị báo cảnh báo 4 lần! Good bye...`,
                event.threadID,
              );
              api.removeUserFromGroup(warnedId, event.threadID);
              delDataWarn(warnedId);
            }
          }
        });
      } else {
        return api.sendMessage(
          "Vui lòng tag một người! hoặc reply tin nhắn của người cần warn",
          event.threadID,
        );
      }
    }
  }
}
