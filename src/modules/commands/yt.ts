import axios from "axios";
import * as cache from "memory-cache";
import * as fs from "fs";
import { join } from "path";
import * as ytdl from "@distube/ytdl-core";

export default class YtCommand {
  static config = {
    name: "yt",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description:
      "Cách dùng[prefix]yt search [tìm kiếm gì đó ở đây]\nChức năng: tải video từ youtube về",
  };

  constructor(private client) {}
  async event(api, event, client) {
    if (event.type == "message_reply") {
      const listVideoYoutubeSearch = cache.get("list-video-youtube-search");
      if (
        listVideoYoutubeSearch &&
        event.messageReply.messageID == listVideoYoutubeSearch.messageID
      ) {
        listVideoYoutubeSearch.data.forEach((item) => {
          if (event.body == item.index) {
            let video;
            const path = join(
              process.cwd(),
              `/public/videos/${item.index}.mp4`
            );
            ytdl
              .getInfo(item.id)
              .then((res) => {
                if (parseInt(res.videoDetails.lengthSeconds) > 900) {
                  console.log(res.videoDetails.lengthSeconds);
                  api.sendMessage(
                    "Xin lỗi video này quá dài bạn vui lòng tự nhấn xem tại: " +
                      "https://www.youtube.com/watch?v=" +
                      item.id,
                    event.threadID
                  );
                  return;
                }
                const videoUrl = res.formats.filter(
                  (item) =>
                    item.hasAudio == true &&
                    item.hasAudio == true &&
                    item.quality == "medium"
                )[0].url;
                // console.log(videoUrl);
                axios
                  .get(videoUrl, { responseType: "arraybuffer" })
                  .then((res) => {
                    const buffer = Buffer.from(res.data);
                    fs.writeFileSync(path, buffer);
                    video = fs.createReadStream(path);
                    api.sendMessage(
                      {
                        attachment: video,
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
    if (args[1] == "search") {
      const search = event.body.split("search")[1];
      var listVideoResult = [];
      let index = 1;
      await axios
        .get(`https://www.googleapis.com/youtube/v3/search`, {
          params: {
            q: search,
            regionCode: "vi",
            type: "video",
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
            "list-video-youtube-search",
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
}
