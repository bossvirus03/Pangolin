import axios from "axios";
import * as fs from "fs";
import { join } from "path";
import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";

export default class RankCommand {
  static config = {
    name: "findAnime", //tên lệnh của bạn
    version: "",
    author: "",
    createdAt: "",
    description: "",
  };

  constructor(private client) {}
  async run(api: Ifca, event: IEvent, client, args, DataUser, DataThread) {
    if (event.type === "message_reply") {
      const imgPath = join(
        process.cwd(),
        `public/images/${event.messageID}.jpg`
      );
      const imageLink = event.messageReply.attachments[0].url;
      axios.get(imageLink).then(async (response) => {
        const buffer = Buffer.from(response.data);
        fs.writeFileSync(imgPath, buffer);
        const img = fs.readFileSync(imgPath);
        const base64String = Buffer.from(img).toString("binary");
        console.log(base64String);
        // const inputStream = fs.createReadStream(imgPath);
        // const formData = new FormData();
        // formData.append("image", inputStream, { filename: "image.jpg" });
      });

      //   console.log(image);
    }
  }
}
