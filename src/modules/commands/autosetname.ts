import fs from "fs";
import { join } from "path";
import {
  IPangolinHandleEvent,
  IPangolinRun,
} from "src/types/type.pangolin-handle";

export default class AutosetnameCommand {
  static config = {
    category: "GROUP",
    name: "autosetname",
    version: "1.0.0",
    author: "Nguyên Blue",
    description: "khi có thành viên mới vào nhóm bot sẽ tự động set name",
  };

  constructor(private client) {}

  async handleEvent({ api, event, client }: IPangolinHandleEvent) {
    const { threadID } = event;
    const pathData = join(process.cwd(), `/src/db/data/autosetname.json`);

    // Check if the message is about added participants
    if (event.logMessageData && event.logMessageData.addedParticipants) {
      if (!fs.existsSync(pathData)) {
        fs.writeFileSync(pathData, "[]", "utf-8");
      }

      const memJoin = event.logMessageData.addedParticipants.map(
        (info) => info.userFbId,
      );
      for (const idUser of memJoin) {
        const dataJson = JSON.parse(fs.readFileSync(pathData, "utf-8"));
        const thisThread = dataJson.find(
          (item) => item.threadID == threadID,
        ) || { threadID, nameUser: [] };
        if (thisThread.nameUser.length != 0) {
          const setName = thisThread.nameUser[0];
          const threadInfo: any = await new Promise((resolve, reject) => {
            api.getThreadInfo(event.threadID, (err, info) => {
              if (err) reject(err);
              else resolve(info);
            });
          });
          const senderInfo = (
            await threadInfo.userInfo.find((info) => info.id === idUser)
          ).name;
          api.changeNickname(`${setName} ${senderInfo}`, threadID, idUser);

          api.sendMessage(
            {
              body: `Đã đặt biệt danh cho thành viên mới: ${setName} ${senderInfo}`,
            },
            threadID,
          );
        }
      }
    }

    // Check if the event type is log:subscribe
    if (event.logMessageType == "log:subscribe") {
      const targetId = event.threadID;

      // if (event.isGroup && !await guilds.findById(targetId)) {
      //   const guildData = new guilds({
      //     _id: targetId,
      //   })
      //   await guildData.save();

      //   return api.sendMessage({
      //     body: `〈 𝐒𝐮𝐜𝐜𝐞𝐬𝐬 〉\n→ Bot vừa set biệt danh tạm thời cho thành viên mới`
      //   }, threadID, event.messageID)
      // }
    }
  }

  async run({ api, event, client, args }: IPangolinRun) {
    const { threadID } = event;
    const pathData = join(process.cwd(), `/src/db/data/autosetname.json`);
    const content = args.slice(2).join(" ");
    const dataJson = JSON.parse(fs.readFileSync(pathData, "utf-8"));
    const thisThread = dataJson.find((item) => item.threadID == threadID) || {
      threadID,
      nameUser: [],
    };

    switch (args[1]) {
      case "add": {
        if (content.length == 0)
          return api.sendMessage(
            "→ Phần cấu hình tên thành viên mới không được bỏ trống!",
            threadID,
          );
        if (thisThread.nameUser.length > 0)
          return api.sendMessage(
            "→ Vui lòng xóa cấu hình tên cũ trước khi đặt tên mới!!!",
            threadID,
          );
        thisThread.nameUser.push(content);
        const threadInfo: any = await new Promise((resolve, reject) => {
          api.getThreadInfo(event.threadID, (err, info) => {
            if (err) reject(err);
            else resolve(info);
          });
        });
        const name = (
          await threadInfo.userInfo.find((info) => info.id === event.senderID)
        ).name;
        fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
        api.sendMessage(
          `→ Đặt cấu hình tên thành viên mới thành công\n→ Preview: ${content}`,
          threadID,
        );
        break;
      }
      case "rm":
      case "remove":
      case "delete": {
        if (thisThread.nameUser.length == 0)
          return api.sendMessage(
            "→ Nhóm bạn chưa đặt cấu hình tên thành viên mới!!",
            threadID,
          );
        thisThread.nameUser = [];
        fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
        api.sendMessage(
          `→ Xóa thành công phần cấu hình tên thành viên mới`,
          threadID,
        );
        break;
      }
      default: {
        api.sendMessage(
          `〈 HDSD 〉\n→ Dùng: autosetname add <name> để cấu hình biệt danh cho thành viên mới\n→ Dùng: autosetname remove để xóa cấu hình đặt biệt danh cho thành viên mới`,
          threadID,
        );
      }
    }
    if (!dataJson.some((item) => item.threadID == threadID)) {
      dataJson.push(thisThread);
      fs.writeFileSync(pathData, JSON.stringify(dataJson, null, 4), "utf-8");
    }
  }
}
