import axios from "axios";
import * as fs from "fs";
import { join } from "path";

import { IPangolinRun } from "src/types/type.pangolin-handle";
export default class NhentaiCommand {
  static config = {
    category: "",
    name: "nhentai",
    version: "1.0.0",
    author: "Lợi",

    description:
      "Cách dùng: [prefix]nhentai [tag] random ảnh anime 18+\nChức năng: xem ảnh anime 18+",
  };

  constructor(private client) {}

  async run({ api, event, client, args }: IPangolinRun) {
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
        return api.sendMessage("Vui lòng chọn 1 tag", event.threadID);
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
          return api.sendMessage(
            "Không thấy hình ảnh nào, Vui lòng chọn tag khác!",
            event.threadID,
          );
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
              body: "18+ cân nhắc trước khi sử dụng",
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
