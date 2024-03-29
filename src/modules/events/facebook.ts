import * as fs from "fs";
import axios from "axios";
import { join } from "path";
import Ifca from "src/types/type.api";

export default class FacabookCommand {
  static config = {
    name: "facebook",
    version: "1.0.0",
    author: "Nguyên Blue",
    createdAt: "",
    description: "autodown facebook",
  };

  constructor(private client) {}

  async run(api: Ifca, event) {
    if (event.body === undefined) return;
    try {
      const str = urlify(event.body);
      const send = (msg) =>
        api.sendMessage(msg, event.threadID, event.messageID);
      if (/fb|facebook/.test(str)) {
        const res = (
          await axios.get(
            `https://j2download.net/api/facebook/media?url=${str}`
          )
        ).data;
        let attachment = [];
        if (res.attachments && res.attachments.length > 0) {
          if (res.attachments[0].type === "Video") {
            for (const facebook of res.attachments) {
              const videoUrl = facebook.url.sd || facebook.url.hd;
              attachment.push(await streamURL(videoUrl, "mp4"));
            }
          } else if (res.attachments[0].type === "Photo") {
            for (const attachmentItem of res.attachments) {
              const urlImg = attachmentItem.url;
              attachment.push(await streamURL(urlImg, "jpg"));
            }
          }
          send({
            body: `${res.message || "Không Có Tiêu Đề"}\n`,
            attachment,
          });
        }
      }
    } catch (e) {
      console.log("Lỗi", e);
    }
  }
}
function urlify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  return text.match(urlRegex);
}
async function streamURL(url, type) {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    const path = join(__dirname, `/cache/${Date.now()}.${type}`);
    fs.writeFileSync(path, res.data);
    setTimeout((p) => fs.unlinkSync(p), 1000 * 60, path);
    return fs.createReadStream(path);
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
}
