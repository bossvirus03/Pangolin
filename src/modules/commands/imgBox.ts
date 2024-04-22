import axios from "axios";
import * as fs from "fs";
import { join } from "path";

import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class ImgBoxCommand {
  static config = {
    category: "GROUP",
    name: "imgbox",
    version: "1.0.0",
    author: "Lợi",
    description: {
      vi: "Đổi avatar nhóm",
      en: "Change group avatar",
    },
    guide: {
      vi: "[prefix]imgbox(Reply 1 bức ảnh)",
      en: "[prefix]imgbox(Reply 1 photo)",
    },
    permission: 1,
  };

  static message = {
    vi: {
      syntaxError: "Vui lòng reply ít nhất 1 ảnh!",
      errorPhoto: "Đã xảy ra lỗi khi đổi ảnh vui lòng thử ảnh khác",
      changeSuccess: "Đã đổi ảnh nhóm thành công",
    },
    en: {
      syntaxError: "Please reply with at least 1 photo!",
      errorPhoto:
        "An error occurred while changing the photo. Please try another photo",
      changeSuccess: "Group photo changed successfully",
    },
  };
  constructor(private client) {}
  async run({ api, event, getLang }: IPangolinRun) {
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
            api.sendMessage(getLang("changeSuccess"), event.threadID);
          })
          .catch((error) => {
            api.sendMessage(getLang("errorPhoto"), event.threadID);
            console.error("Error downloading image:", error);
          });
      }
      return;
    }
    api.sendMessage(getLang("syntaxError"), event.threadID);
  }
}
