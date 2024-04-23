import axios from "axios";
import * as cache from "memory-cache";
import * as fs from "fs";
import { join } from "path";
import * as ytdl from "@distube/ytdl-core";

import {
  IPangolinHandleEvent,
  IPangolinRun,
} from "src/types/type.pangolin-handle";

export default class YtCommand {
  static config = {
    category: "MEDIA",
    name: "video",
    version: "1.0.0",
    author: "Lợi",
    description: {
      vi: "Tìm kiếm và tải video từ youtube",
      en: "Search and download video from youtube",
    },
    guide: {
      vi: "[prefix]video (tìm gì đó)",
      en: "[prefix]video (find something)",
    },
  };

  static message = {
    vi: {
      tooLong: "Video này quá dài vui lòng tự xem tại ",
      info: "Có $0 kết quả phù hợp: $1",
    },
    en: {
      tooLong: "This video is too long, please watch it yourself at",
      info: "There are $0 matches: $1",
    },
  };
  constructor(private client) {}
  async handleEvent({ api, event, getLang }: IPangolinHandleEvent) {
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
              `/public/audios/${item.index}.mp4`,
            );
            ytdl
              .getInfo(item.id)
              .then(async (res) => {
                if (parseInt(res.videoDetails.lengthSeconds) > 900) {
                  api.sendMessage(
                    (await getLang("tooLong")) +
                      "https://www.youtube.com/watch?v=" +
                      item.id,
                    event.threadID,
                  );
                  return;
                }
                const videoUrl = res.formats.filter(
                  (item) => item.hasAudio == true && item.quality == "medium",
                )[0].url;
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
                      event.threadID,
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

  async run({ api, event, pangolin, args, getLang }: IPangolinRun) {
    const search = (event.body as string).split(args[0])[1];
    var listVideoResult = [];
    let index = 1;
    await axios
      .get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          q: search,
          regionCode: "vi",
          type: "audio",
          key: pangolin.commands.youtube_search_api,
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
      getLang("info", listVideoResult.length, smg),
      event.threadID,
      (err, res) => {
        cache.put(
          "list-audio-youtube-search",
          {
            data: listVideoResult,
            messageID: res.messageID,
          },
          5 * 1000 * 60,
        );
      },
      event.messageID,
    );
  }
}
