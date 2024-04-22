import axios from "axios";
import * as fs from "fs";
import { join } from "path";

import { IPangolinRun } from "src/types/type.pangolin-handle";
export default class NhentaiCommand {
  static config = {
    category: "MEDIA",
    name: "nhentai",
    version: "1.0.0",
    author: "Lợi",
    description: {
      vi: "Random ảnh anime 18+",
      en: "Random anime photos 18+",
    },
    guide: {
      vi: "[prefix]nhentai [tag]",
      en: "[prefix]nhentai [tag]",
    },
  };

  static message = {
    vi: {
      syntaxError: "Vui lòng chọn 1 tag",
      notFound: "Không thấy hình ảnh nào, Vui lòng chọn tag khác!",
      warning: "18+ cân nhắc trước khi sử dụng",
    },
    en: {
      syntaxError: "Please choose 1 tag",
      notFound: "No images found, Please choose another tag!",
      warning: "18+ considerations before use",
    },
  };
  constructor(private client) {}

  async run({ api, event, getLang, args }: IPangolinRun) {
    try {
      const imgPath = join(
        process.cwd(),
        `/public/images/${event.threadID}.png`,
      );
      const response = await axios.get("https://wholesomelist.com/api/list");
      const table = response.data.table;
      const images = table.map((item) => {
        return {
          image: item.image,
          tag: item.tags,
        };
      });

      const uniqueTags = new Set();
      for (const item of images) {
        for (const tag of item.tag) {
          if (!uniqueTags.has(tag)) {
            uniqueTags.add(tag);
          }
        }
      }
      if (!args[1]) {
        return api.sendMessage(getLang("syntaxError"), event.threadID);
      }
      if (args[1] == "tag") {
        return api.sendMessage(
          Array.from(uniqueTags).join(" ,"),
          event.threadID,
        );
      }
      const tag = args.join(" ").split(args[0])[1].trim();
      function getRandomImage(images) {
        const tagItems = images.filter((item) => {
          return item.tag.includes(tag);
        });
        if (!tagItems) {
          return api.sendMessage(getLang("notFound"), event.threadID);
        }
        const randomIndex = Math.floor(Math.random() * tagItems.length);
        const item = tagItems[randomIndex];
        return item.image;
      }

      const urlImage = getRandomImage(images);
      await axios
        .get(urlImage, {
          responseType: "arraybuffer",
        })
        .then((response) => {
          const imgPath = join(
            process.cwd(),
            `/public/images/${event.messageID}.png`,
          );
          const buffer = Buffer.from(response.data);
          fs.writeFileSync(imgPath, buffer);
          const img = fs.createReadStream(imgPath);
          api.sendMessage(
            {
              attachment: img,
              body: getLang("warning"),
            },
            event.threadID,
            (err) => {
              if (err) return console.log(err);
            },
            event.messageID,
          );
        });
    } catch (error) {
      console.log(error);
    }
  }
}
