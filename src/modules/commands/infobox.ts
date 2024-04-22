import { join } from "path";
import fs from "fs";
import axios from "axios";
import request from "request";
import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class InfoboxCommand {
  static config = {
    category: "INFO",
    name: "infobox",
    version: "1.0.0",
    author: "Nguyên Blue",
    guide: {
      vi: "[prefix]infobox",
      en: "[prefix]infobox",
    },
    description: {
      vi: "Hiển thị thông tin của Group",
      en: "Display Group information",
    },
  };

  static message = {
    vi: {
      info: "🏘️ Box: $0\n🔢 ID: $1\n🔒 Phê duyệt: $2\n📝 Emoji: $3\n✏️ Thông tin: $4 thành viên $5 nam $6 nữ\n🧿 Tổng QTV: $7\n\n$8\n💬 Tổng: $9 tin nhắn\n♻️ Tổng $10 tin nhắn thu hồi\n📊 Mức tương tác: 100%",
    },
    en: {
      info: "🏘️ Box: $0\n🔢 ID: $1\n🔒 Approval: $2\n📝 Emoji: $3\n✏️ Information: $4 members $5 men $6 women\n   Total QTV: $7\n\n $8\n💬 Total: $9 messages\n♻️ Total $10 recall messages\n📊 Interaction level: 100%",
    },
  };
  constructor(private client) {}

  async run({ api, event, getLang }: IPangolinRun) {
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
            body: getLang(
              "info",
              threadName,
              id,
              pd,
              icon || "👍",
              threadMem,
              nam,
              nu,
              qtv,
              listName,
              sl,
              un,
            ),
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
