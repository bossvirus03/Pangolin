import * as fs from "fs";
import { join } from "path";
import Ifca from "src/types/type.api";

export default class NotiCommand {
  static config = {
    name: "joinNoti",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description: "Thông báo khi có thành viên mới rời nhóm chat",
  };

  static message = {
    vi: {
      join: `Chào mừng $0 đã đến với $1 $2 là thành viên thứ $3 của nhóm.`,
      addBot: `Cảm ơn bạn đã thêm bot vào nhóm\nSử dụng $0help để xem tất cả các lệnh!`,
    },
    en: {
      listCommand: "",
    },
  };
  constructor(private client) {}
  run(api, event, client, UserData, ThreadData, UserInThreadData, getLang) {
    const GifPath = join(process.cwd(), "/src/db/data/join/join.gif");
    if (event.logMessageType != "log:subscribe") return;
    api.getThreadInfo(event.threadID, async (err, info) => {
      if (err) {
        console.error("Error fetching thread info:", err);
        return;
      }
      const arrPersonJoin = await event.logMessageData.addedParticipants.map(
        (item) => {
          return {
            tag: item.fullName,
            id: item.userFbId,
          };
        }
      );
      if (arrPersonJoin.some((item) => item.id == process.env.UID_BOT)) {
        return api.sendMessage(
          getLang("addBot", process.env.PREFIX),
          event.threadID
        );
      } else {
        const nameUsers = arrPersonJoin.map((item) => {
          return item.tag;
        });
        const msgBody = getLang(
          "join",
          nameUsers.length > 1 ? nameUsers.join(" và ") : nameUsers[0],
          info.threadName,
          nameUsers.length > 1 ? ` ${nameUsers.length} bạn` : " Bạn",
          info.participantIDs.length
        );
        api.sendMessage(
          {
            body: msgBody,
            mentions: arrPersonJoin,
            attachment: fs.createReadStream(GifPath),
          },
          event.threadID
        );
      }
    });
  }
}
