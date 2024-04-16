import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import axios from "axios";
import fs from "fs-extra";
import { join } from "path";

export default class Mp3Command {
  static config = {
    name: "zingmp3",
    version: "1.0.0",
    author: "Nguyên Blue",
    createdAt: "",
    description:
      "Cách dùng: [prefix]zingmp3 search",
  };

  constructor(private client) {}
  async run(api: Ifca, event: IEvent, client, args) {
    const text = (event.body as string).split(args[0])[1];
    const encodedText = encodeURIComponent(text);
    try {
      const response = await axios.get(`http://ac.mp3.zing.vn/complete?type=artist,song,key,code&num=500&query=${encodedText}`);
      
      if (response.data.result && response.data.data && response.data.data.length > 0) {
        const songId = response.data.data[0].song[0].id;
        const casi = response.data.data[0].song[0].artist;
        const name = response.data.data[0].song[0].name;
        const songResponse = await axios.get(`http://api.mp3.zing.vn/api/streaming/audio/${songId}/320`, {
          responseType: 'arraybuffer'
        });
        const path = join(
              process.cwd(),
              `/public/audios/${songId}.mp3`
            );
        fs.writeFileSync(path, Buffer.from(songResponse.data, 'utf-8'));

        api.sendMessage({ body: `${name} - ${casi}`, attachment: fs.createReadStream(path) }, event.threadID);
      } else {
        api.sendMessage('Không tìm thấy bài hát phù hợp.', event.threadID);
      }
    } catch (error) {
      console.error('Đã xảy ra lỗi khi tải bài hát:', error);
      api.sendMessage("Có lỗi xảy ra khi tải bài hát.", event.threadID);
    }
  }
}
