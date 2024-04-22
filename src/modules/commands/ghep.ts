import { join } from "path";
import fs from "fs";
import axios from "axios";
import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class GhepCommand {
  static config = {
    category: "GROUP",
    name: "ghep",
    version: "1.0.0",
    author: "Nguyên Blue",

    description: {
      en: "Randomly pair with group members",
      vi: "Ghép đôi ngẫu nhiên với thành viên trong nhóm",
    },
    guide: {
      vi: "[prefix]ghep",
      en: "[prefix]ghep",
    },
  };

  static message = {
    vi: {
      notGroup: "Đây không phải 1 nhóm!",
      pairSuccess: "⚡️Ghép đôi thành công!\n⚡️Tỉ lệ hợp đôi: $0%\n$1 💓 $2",
    },
    en: {
      notGroup: "This is not a group!",
      pairSuccess: "⚡️Matching success!\n⚡️Matching rate: $0%\n$1 💓 $2",
    },
  };

  constructor(private client) {}

  async run({ api, event, getLang }: IPangolinRun) {
    if (!event.isGroup) {
      return api.sendMessage(getLang("notGroup"), event.threadID);
    }
    try {
      const threadInfo: any = await new Promise((resolve, reject) => {
        api.getThreadInfo(event.threadID, (err, info) => {
          if (err) reject(err);
          else resolve(info);
        });
      });
      const users = threadInfo.participantIDs;
      const senderInfo = (
        await threadInfo.userInfo.find((info) => info.id === event.senderID)
      ).name;

      let randomUser = users[Math.floor(Math.random() * users.length)];
      while (randomUser === event.senderID) {
        randomUser = users[Math.floor(Math.random() * users.length)];
      }

      const matchInfo = (
        await threadInfo.userInfo.find((info) => info.id === randomUser)
      ).name;

      const tile = Math.floor(Math.random() * 101);

      const path = join(process.cwd(), `/public/videos`);

      const [avatar1, avatar2] = await Promise.all([
        axios.get(
          `https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" },
        ),
        axios.get(
          `https://graph.facebook.com/${randomUser}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" },
        ),
      ]);

      fs.writeFileSync(`${path}/avt.png`, Buffer.from(avatar1.data, "utf-8"));
      fs.writeFileSync(`${path}/avt2.png`, Buffer.from(avatar2.data, "utf-8"));

      const message = {
        body: getLang("pairSuccess", tile, senderInfo, matchInfo),
        mentions: [
          { id: event.senderID, tag: senderInfo },
          { id: randomUser, tag: matchInfo },
        ],
        attachment: [
          fs.createReadStream(`${path}/avt.png`),
          fs.createReadStream(`${path}/avt2.png`),
        ],
      };

      api.sendMessage(message, event.threadID);
    } catch (error) {
      console.error("Error:", error);
    }
  }
}
