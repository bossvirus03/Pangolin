import * as fs from "fs";
import { join } from "path";
import Ifca from "src/types/type.api";

export default class NotiCommand {
  static config = {
    name: "leaveNoti",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description: "Thông báo khi có thành viên mới tham gia nhóm chat",
  };

  constructor(private client) {}

  async run(api: Ifca, event) {
    const GifPath = join(process.cwd(), "/src/database/data/leave/leave.gif");
    if (event.logMessageType === "log:unsubscribe") {
      const infoUser = await api.getUserInfo(
        event.logMessageData.leftParticipantFbId,
        (err, user) => {
          if (err) return console.log(err);
        }
      );

      if (event.logMessageData.leftParticipantFbId === event.author) {
        api.sendMessage(
          {
            body:
              infoUser[event.logMessageData.leftParticipantFbId].name +
              " đã tự rời khỏi nhóm",
            attachment: fs.createReadStream(GifPath),
          },
          event.threadID
        );
      } else {
        api.sendMessage(
          {
            body:
              infoUser[event.logMessageData.leftParticipantFbId].name +
              " đã bị admin đá khỏi nhóm",
            attachment: fs.createReadStream(GifPath),
          },
          event.threadID
        );
      }
    }
  }
}
