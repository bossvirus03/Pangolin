import { IPangolinRun } from "src/types/type.pangolin-handle";
import axios from "axios";
import * as fs from "fs";
import { join } from "path";
export default class SetAvt {
  static config = {
    name: "setavt",
    version: "1.0.0",
    author: "Lợi",
    category: "ADMIN",
    permission: 2,
    description: {
      vi: "Đổi avatar bot",
      en: "Change bot avatar",
    },
    guide: {
      vi: "[prefix]setavt (reply 1 ảnh)",
      en: "[prefix]setavt (reply 1 photo)",
    },
  };

  static message = {
    vi: {
      success: "Đã đổi avt bot thành công",
      imageError: "Đã sảy ra lỗi vui lòng thử ảnh khác",
      needReply: "Vui lòng reply 1 hình ảnh!",
    },
    en: {
      success: "Successfully changed bot avatar",
      imageError: "An error occurred, please try another photo",
      needReply: "Please reply with 1 image!",
    },
  };

  constructor(private client) {}
  async run({ api, event, getLang, args }: IPangolinRun) {
    if (event.type == "message_reply") {
      const imgPath = join(process.cwd(), `/public/images/avt.png`);
      if (event.messageReply.attachments[0].type == "photo") {
        await axios
          .get(event.messageReply.attachments[0].url, {
            responseType: "arraybuffer",
          })
          .then((response) => {
            const buffer = Buffer.from(response.data);
            fs.writeFileSync(imgPath, buffer);
            const img = fs.createReadStream(imgPath);
            const caption = (event.body as string).split(args[0])[1];
            api.changeAvt(img, caption as string);
          })
          .then(() => {
            api.sendMessage(getLang("success"), event.threadID);
          })
          .catch((error) => {
            api.sendMessage(getLang("imageError"), event.threadID);
          });
      }
      return;
    }
    api.sendMessage(getLang("needReply"), event.threadID);
  }
}
