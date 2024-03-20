import axios from "axios";
import * as fs from "fs";
import { request } from "http";
import path, { join } from "path";

export default class NotiCommand {
  static config = {
    name: "JoinNoti",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
  };

  constructor(private client) {}
  run(api, event, args) {
    // Your run logic here
    const GifPath = join(process.cwd(), "/src/database/data/join/join.gif");
    if (event.logMessageType != "log:subscribe") return;
    let msgBody;
    api.getThreadInfo(event.threadID, (err, info) => {
      if (err) {
        console.error("Error fetching thread info:", err);
        return;
      }
      if (!info || !info.imageSrc) {
        console.error("Image source is undefined or null.");
        return;
      }
      const addedParticipant = event.logMessageData.addedParticipants[0];
      const msgBody = `Chào mừng ${addedParticipant.fullName} đã đến với ${info.threadName}. Bạn là thành viên thứ ${info.participantIDs.length} của nhóm.`;
      api.sendMessage(
        {
          body: msgBody,
          mentions: [
            {
              tag: addedParticipant.fullName,
              id: addedParticipant.userId,
            },
          ],
          attachment: fs.createReadStream(GifPath),
        },
        event.threadID
      );
    });
  }
}
