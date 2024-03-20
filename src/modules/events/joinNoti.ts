import * as fs from "fs";
import { join } from "path";

export default class NotiCommand {
  static config = {
    name: "joinNoti",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description: "Thông báo khi có thành viên mới rời nhóm chat",
  };

  constructor(private client) {}
  run(api, event) {
    const GifPath = join(process.cwd(), "/src/database/data/join/join.gif");
    if (event.logMessageType != "log:subscribe") return;
    api.getThreadInfo(event.threadID, (err, info) => {
      if (err) {
        console.error("Error fetching thread info:", err);
        return;
      }
      if (!info || !info.imageSrc) {
        console.error("Image source is undefined or null.");
        return;
      }
      const arrPersonJoin = event.logMessageData.addedParticipants.map(
        (item) => {
          return {
            tag: item.fullName,
            id: item.userFbId,
          };
        }
      );
      const nameUsers = arrPersonJoin.map((item) => {
        return item.tag;
      });
      const msgBody =
        `Chào mừng ` +
        (nameUsers.length > 1 ? nameUsers.join(" và ") : nameUsers[0]) +
        ` đã đến với ${info.threadName}.` +
        (nameUsers.length > 1 ? ` ${nameUsers.length} bạn` : " Bạn") +
        ` là thành viên thứ ${info.participantIDs.length} của nhóm.`;
      api.sendMessage(
        {
          body: msgBody,
          mentions: arrPersonJoin,
          attachment: fs.createReadStream(GifPath),
        },
        event.threadID
      );
    });
  }
}
