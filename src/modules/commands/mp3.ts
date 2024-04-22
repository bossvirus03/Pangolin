import axios from "axios";
import fs from "fs-extra";
import { join } from "path";
import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class Mp3Command {
  static config = {
    category: "MEDIA",
    name: "zingmp3",
    version: "1.0.0",
    author: "Nguyên Blue",
    description: {
      en: "Listen to music on zingmp3",
      vi: "Nghe nhạc trên zingmp3",
    },
    guide: {
      en: "[prefix]zingmp3 (song name)",
      vi: "[prefix]zingmp3 (tên bài hát)",
    },
  };

  static message = {
    en: {
      error: "An error occurred while downloading the song.",
      notFound: "No suitable song found.",
    },
    vi: {
      error: "Có lỗi xảy ra khi tải bài hát.",
      notFound: "Không tìm thấy bài hát phù hợp.",
    },
  };
  constructor(private client) {}
  async run({ api, event, getLang, args }: IPangolinRun) {
    const text = (event.body as string).split(args[0])[1];
    const encodedText = encodeURIComponent(text);
    try {
      const response = await axios.get(
        `http://ac.mp3.zing.vn/complete?type=artist,song,key,code&num=500&query=${encodedText}`,
      );

      if (
        response.data.result &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const songId = response.data.data[0].song[0].id;
        const casi = response.data.data[0].song[0].artist;
        const name = response.data.data[0].song[0].name;
        const songResponse = await axios.get(
          `http://api.mp3.zing.vn/api/streaming/audio/${songId}/320`,
          {
            responseType: "arraybuffer",
          },
        );
        const path = join(process.cwd(), `/public/audios/${songId}.mp3`);
        fs.writeFileSync(path, Buffer.from(songResponse.data, "utf-8"));

        api.sendMessage(
          { body: `${name} - ${casi}`, attachment: fs.createReadStream(path) },
          event.threadID,
        );
      } else {
        api.sendMessage(getLang("notFound"), event.threadID);
      }
    } catch (error) {
      api.sendMessage(getLang("error"), event.threadID);
    }
  }
}
