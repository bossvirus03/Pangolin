import axios from "axios";
import fs from "fs-extra";
import { join } from "path";
import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class LamNetCommand {
  static config = {
    category: "MEDIA",
    name: "4k",
    version: "1.0.0",
    author: "Nguyên Blue",
    description: {
      vi: "Làm nét ảnh bằng AI",
      en: "Sharpen photos with AI",
    },
    guide: {
      vi: "[prefix]4k (reply 1 ảnh)",
      en: "[prefix]4k (reply 1 photo)",
    },
  };
  static message = {
    vi: {
      text1: "",
      text2: "",
    },
    en: {
      waitToProcess: "🕟 | 𝚄𝚙𝚜𝚌𝚊𝚕𝚒𝚗𝚐 𝙸𝚖𝚊𝚐𝚎, 𝙿𝚕𝚎𝚊𝚜𝚎 𝚠𝚊𝚒𝚝 𝚏𝚘𝚛 𝚊 𝚖𝚘𝚖𝚎𝚗𝚝..",
      errReply: "🤖 𝙿𝚕𝚎𝚊𝚜𝚎 𝚛𝚎𝚙𝚕𝚢 𝚝𝚘 𝚊 𝚙𝚑𝚘𝚝𝚘 𝚝𝚘 𝚙𝚛𝚘𝚌𝚎𝚎𝚍 𝚞𝚙𝚜𝚌𝚊𝚕𝚒𝚗𝚐 𝚒𝚖𝚊𝚐𝚎𝚜.",
      upScaling: "🔮 𝚄𝚙𝚜𝚌𝚊𝚕𝚎 𝚂𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢",
      errUpScaling: "🚫 𝙴𝚛𝚛𝚘𝚛 𝚙𝚛𝚘𝚌𝚎𝚜𝚜𝚒𝚗𝚐 𝚒𝚖𝚊𝚐𝚎: $0",
    },
  };
  constructor(private client) {}

  async run({ api, event, getLang, args }: IPangolinRun) {
    const pathie = join(process.cwd(), `/public/images/zombie.jpg`);
    const { threadID } = event;

    const photoUrl = event.messageReply.attachments[0]
      ? event.messageReply.attachments[0].url
      : args.slice(1).join(" ");

    if (!photoUrl) {
      api.sendMessage(getLang("errReply"), threadID);
      return;
    }

    api.sendMessage(getLang("waitToProcess"), threadID, async () => {
      try {
        const response = await axios.get(
          `https://hazee-upscale.replit.app/upscale?url=${encodeURIComponent(photoUrl)}&face_enhance=true`,
        );
        const processedImageURL = response.data.hazescale;
        const img = (
          await axios.get(processedImageURL, { responseType: "arraybuffer" })
        ).data;

        fs.writeFileSync(pathie, Buffer.from(img, "binary"));

        api.sendMessage(
          {
            body: getLang("upScaling"),
            attachment: fs.createReadStream(pathie),
          },
          threadID,
          () => fs.unlinkSync(pathie),
        );
      } catch (error) {
        api.sendMessage(getLang("errUpScaling", error), threadID);
      }
    });
  }
}
