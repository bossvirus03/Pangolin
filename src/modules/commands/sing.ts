import axios from "axios";
import * as cache from "memory-cache";
import * as fs from "fs";
import { join } from "path";
import * as ytdl from "@distube/ytdl-core";

export default class YtCommand {
  static config = {
    name: "sing",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description:
      "Cách dùng: [prefix]sing [tìm kiếm gì đó ở đây]\nChức năng: tải audio từ youtube về",
  };

  constructor(private client) {}
  async event(api, event, client) {
    if (event.type == "message_reply") {
      const listVideoYoutubeSearch = cache.get("list-audio-youtube-search");
      if (
        listVideoYoutubeSearch &&
        event.messageReply.messageID == listVideoYoutubeSearch.messageID
      ) {
        listVideoYoutubeSearch.data.forEach((item) => {
          if (event.body == item.index) {
            let audio;
            const path = join(
              process.cwd(),
              `/public/audios/${item.index}.mp3`
            );
            ytdl
              .getInfo(item.id)
              .then((res) => {
                if (parseInt(res.videoDetails.lengthSeconds) > 1500) {
                  api.sendMessage(
                    "Xin lỗi audio này quá dài bạn vui lòng tự nhấn xem tại: " +
                      "https://www.youtube.com/watch?v=" +
                      item.id,
                    event.threadID
                  );
                  return;
                }
                const videoUrl = res.formats.filter(
                  (item) => item.hasAudio == true && item.quality == "medium"
                )[0].url;
                // console.log(videoUrl);
                axios
                  .get(videoUrl, { responseType: "arraybuffer" })
                  .then((res) => {
                    const buffer = Buffer.from(res.data);
                    fs.writeFileSync(path, buffer);
                    audio = fs.createReadStream(path);
                    api.sendMessage(
                      {
                        attachment: audio,
                        body: "Download success",
                      },
                      event.threadID
                    );
                  });
              })
              .catch((error) => {
                console.log(error);
              });
          }
        });
      }
    }
  }

  async run(api, event, client, args) {
    const search = event.body.split(args[0])[1];
    var listVideoResult = [];
    let index = 1;
    await axios
      .get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          q: search,
          regionCode: "vi",
          type: "audio",
          key: process.env.YOUTUBE_API_KEY,
          part: "snippet",
          maxResults: 5,
        },
      })
      .then((res) => {
        res.data.items.forEach((item) => {
          listVideoResult.push({
            id: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            index,
          });
          index++;
        });
      });
    let smg = "";
    listVideoResult.forEach((item) => {
      smg += `[${item.index}] - ${item.title}\nChannel: ${item.channel}\n\n`;
    });
    api.sendMessage(
      `Có ${listVideoResult.length} kết quả phù hợp: \n` + smg,
      event.threadID,
      (err, res) => {
        cache.put(
          "list-audio-youtube-search",
          {
            data: listVideoResult,
            messageID: res.messageID,
          },
          5 * 1000 * 60
        );
      }
    );
  }
}
