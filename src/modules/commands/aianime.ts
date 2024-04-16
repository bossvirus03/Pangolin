import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import axios from "axios";
import fs from "fs-extra";
import { join } from "path";

export default class AianimeCommand {
  static config = {
    name: "aianime",
    version: "1.0.0",
    author: "Nguyên Blue",
    createdAt: "",
    description: "Cách dùng: [prefix]aianime reply ảnh hoặc url",
  };

  constructor(private client) {}

  async run(api: Ifca, event: IEvent, client, args) {
    const { threadID } = event;
    if (event.type == "message_reply") {
      if (event.messageReply.attachments) {
        try {
          const attachments = event.messageReply.attachments;
          const promises = attachments.map(async (item) => {
            const res = await axios.get(`https://sumiproject.io.vn/imgur?link=${encodeURIComponent(item.url)}`);
            const link = res.data.uploaded.image;
            api.sendMessage(`⏱️ | Tiến hành xử lý ảnh, vui lòng chờ...`, threadID, (err, info) => setTimeout(() => { api.unsendMessage(info.messageID) }, 5000));
            const rec = await axios.get(`https://apichatbot.sumiproject.io.vn/phototoanime?url=${link}`)
      const imageURL = `https://www.drawever.com${rec.data}`;
            const imagePath = join(process.cwd(), `/public/images/${Date.now()}.jpeg`);
            const imageResponse = await axios.get(imageURL, { responseType: 'arraybuffer' });
            fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, 'binary'));
            return {
              body: `✅ Xử lý ảnh thành công`,
              attachment: fs.createReadStream(imagePath),
            };
          });

          const results = await Promise.all(promises);
          results.forEach(result => {
            api.sendMessage({
              body: result.body,
              attachment: result.attachment
            }, threadID, (err) => {
              if (err) console.log(err);
            }, event.messageID);
          });
        } catch (error) {
          console.error(error);
          throw error;
        }
      }
      return;
    }
    api.sendMessage("Vui lòng reply ít nhất 1 hình ảnh!", event.threadID);
  }
}
