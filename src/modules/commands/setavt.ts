import { IPangolinRun } from "src/types/type.pangolin-handle";
import axios from "axios";
import * as fs from "fs";
import { join } from "path";
export default class SetAvt {
  static config = {
    name: "setavt", //your command name
    version: "1.0.0",
    author: "",
    permission: 2,
    description: {
      vi: "",
      en: "",
    },
    guide: {
      vi: "",
      en: "",
    },
  };

  static message = {
    vi: {
      text1: "",
      text2: "",
    },
    en: {
      text1: "",
      text2: "",
    },
  };

  constructor(private client) {}
  async run({ api, event, client, args, UserData, ThreadData }: IPangolinRun) {
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
            api.sendMessage("Đã avt bot thành công", event.threadID);
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
