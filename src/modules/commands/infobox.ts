import { join } from "path";
import fs from "fs";
import axios from "axios";
import request from "request";
import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class InfoboxCommand {
  static config = {
    category: "",
    name: "infobox",
    version: "1.0.0",
    author: "Nguyên Blue",

    description: "Cách dùng: [prefix]infobox",
  };

  constructor(private client) {}

  async run({ api, event, client, args }: IPangolinRun) {
    try {
      const threadInfo: any = await new Promise((resolve, reject) => {
        api.getThreadInfo(event.threadID, (err, info) => {
          if (err) reject(err);
          else resolve(info);
        });
      });
      let threadMem = threadInfo.participantIDs.length;
      let gendernam = [];
      let gendernu = [];
      let nope = [];

      for (let z in threadInfo.userInfo) {
        let gioitinhone = threadInfo.userInfo[z].gender;
        if (gioitinhone === "MALE") {
          gendernam.push(z + gioitinhone);
        } else if (gioitinhone === "FEMALE") {
          gendernu.push(gioitinhone);
        } else {
          let nName = threadInfo.userInfo[z].name;
          nope.push(nName);
        }
      }

      let nam = gendernam.length;
      let nu = gendernu.length;
      let qtv = threadInfo.adminIDs.length;

      const listad = threadInfo.adminIDs.map((admin) => admin.id);
      let listName = "";
      for (let item of threadInfo.userInfo) {
        if (listad.includes(item.id)) {
          listName += `• ${item.name}\n`;
        }
      }

      let path = join(process.cwd(), `/public/videos`);
      let sl = threadInfo.messageCount;
      let un = threadInfo.unreadCount;
      let icon = threadInfo.emoji;
      let threadName = threadInfo.threadName;
      let id = threadInfo.threadID;
      let sex = threadInfo.approvalMode;
      let pd = sex === false ? "tắt" : sex === true ? "bật" : "Kh";

      let callback = () =>
        api.sendMessage(
          {
            body: `🏘️ Box: ${threadName}\n🔢 ID: ${id}\n🔒 Phê duyệt: ${pd}\n📝 Emoji: ${icon || "👍"}\n✏️ Thông tin: ${threadMem} thành viên ${nam} nam ${nu} nữ\n🧿 Tổng QTV: ${qtv}\n\n${listName}\n💬 Tổng: ${sl} tin nhắn\n♻️ Tổng ${un} tin nhắn thu hồi\n📊 Mức tương tác: 100%`,
            attachment: fs.createReadStream(`${path}/1.png`),
          },
          event.threadID,
          () => fs.unlinkSync(`${path}/1.png`),
          event.messageID,
        );

      request(encodeURI(`${threadInfo.imageSrc}`))
        .pipe(fs.createWriteStream(`${path}/1.png`))
        .on("close", () => callback());
    } catch (error) {
      console.error("Error:", error);
    }
  }
}
