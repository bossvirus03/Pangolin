import * as fs from "fs";
import { join } from "path";
import Ifca from "src/types/type.api";
import { IPangolinEvent } from "src/types/type.pangolin-handle";

export default class NotiCommand {
  static config = {
    category: "",
    name: "leaveNoti",
    version: "1.0.0",
    author: "Lợi",

    description: "Thông báo khi có thành viên mới tham gia nhóm chat",
  };

  constructor(private client) {}

  async run({ api, event }: IPangolinEvent) {
    const GifPath = join(process.cwd(), "/src/db/data/leave/leave.gif");
    if (event.logMessageType === "log:unsubscribe") {
      // console.log(event);
      const infoUser = await api.getUserInfo(
        event.logMessageData.leftParticipantFbId,
        (err, user) => {
          if (err) return console.log(err);
        },
      );
      const UID_BOT = await api.getCurrentUserID();
      if (event.logMessageData.leftParticipantFbId === UID_BOT) return;
      if (event.logMessageData.leftParticipantFbId == event.author) {
        api.sendMessage(
          {
            body:
              infoUser[event.logMessageData.leftParticipantFbId].name +
              " đã tự rời khỏi nhóm",
            attachment: fs.createReadStream(GifPath),
          },
          event.threadID,
        );
      } else {
        api.sendMessage(
          {
            body:
              infoUser[event.logMessageData.leftParticipantFbId].name +
              " đã bị admin đá khỏi nhóm",
            attachment: fs.createReadStream(GifPath),
          },
          event.threadID,
        );
      }
    }
  }
}
