import axios from "axios";
import * as fs from "fs";
import { join } from "path";

import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class ImgBoxCommand {
  static config = {
    name: "imgbox",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description:
      "Cách dùng: [prefix]imgbox(Reply 1 bức ảnh)\nChức năng: đổi avatar nhóm",
    permission: 1,
  };

  constructor(private client) {}
  async run({ api, event, client, args, UserData, ThreadData }: IPangolinRun) {
    if (event.type == "message_reply") {
      const imgPath = join(
        process.cwd(),
        `/public/images/${event.threadID}.png`,
      );
      if (event.messageReply.attachments[0].type == "photo") {
        await axios
          .get(event.messageReply.attachments[0].url, {
            responseType: "arraybuffer",
          })
          .then((response) => {
            const buffer = Buffer.from(response.data);
            fs.writeFileSync(imgPath, buffer);
            const img = fs.createReadStream(imgPath);
            api.changeGroupImage(img, event.threadID, (err) => {
              if (err) return console.log(err);
            });
          })
          .then(() => {
            api.sendMessage("Đã đổi ảnh nhóm thành công", event.threadID);
          })
          .catch((error) => {
            api.sendMessage(
              "Đã xảy ra lỗi khi đổi ảnh vui lòng thử ảnh khác",
              event.threadID,
            );
            console.error("Error downloading image:", error);
          });
      }
      return;
    }
    api.sendMessage("Vui lòng reply 1 hình ảnh!", event.threadID);
  }
}
