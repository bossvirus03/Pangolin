import axios from "axios";
import * as fs from "fs";
import { request } from "http";
import path from "path";

export default class NotiCommand {
  static config = {
    name: "JoinNoti",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
  };

  constructor(private client) {}
  run(api, event, args) {
    // Your run logic here
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

      // axios
      //   .get(info.imageSrc, { responseType: "stream" })
      //   .then((response) => {
      //     const ext = path.extname(info.imageSrc).substring(1); // Extract extension from the image URL
      //     const imagePath = path.join(process.cwd(), "public", `image.${ext}`);

      //     response.data
      //       .pipe(fs.createWriteStream(imagePath))
      //       .on("finish", () => {
      //         api.sendMessage(
      //           {
      //             body: msgBody,
      //             mentions: [
      //               {
      //                 tag: addedParticipant.fullName,
      //                 id: addedParticipant.userId,
      //               },
      //             ],
      //             attachment: fs.createReadStream(imagePath),
      //           },
      //           event.threadID
      //         );
      //       });
      //   })
      //   .catch((error) => {
      //     console.error("Error fetching image:", error);
      //   });
    });
  }
}
