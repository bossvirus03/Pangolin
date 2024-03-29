import * as fs from "fs";
import * as axios from "axios";
import * as Downloader from 'nodejs-file-downloader';
import * as crypto from "crypto";
import { join } from "path";
import Ifca from "src/types/type.api";

export default class TiktokCommand {
  static config = {
    name: "tiktok",
    version: "1.0.0",
    author: "Nguyên Blue",
    createdAt: "",
    description: "autodown tiktok",
  };

  constructor(private client) {}

  async run(api: Ifca, event) {
       try {
      const message = urlify(event.body);
      const send = msg => api.sendMessage(msg, event.threadID, event.messageID);
      const id = crypto.randomBytes(16).toString("hex");
              if (message) {
        for (const url of message) {
          if (/tiktok|douyin/.test(message)) {
            try {
              const tiktok = await tiktokDL(url);
              if (tiktok.code !== 0) return;

              if (!tiktok.images && tiktok.nowm) {
                api.setMessageReaction("📥", event.messageID, () => {}, true);
                const downloader = new Downloader({
                  url: tiktok.nowm,
                  directory: "./.temp",
                });
                try {
                  const { filePath, downloadStatus } = await downloader.download();

                  api.setMessageReaction("⌛", event.messageID, () => {}, true);

                  var msg = {
                    body: `📺 Kênh: ${tiktok.name}\n🔗 URL: https://www.tiktok.com/@${tiktok.unique}\n📝 Tiêu Đề: ${!tiktok.title ? "" : tiktok.title + "\n"}⛳ Quốc Gia: ${tiktok.region}\n⏱️ Thời Gian Load: ${tiktok.times}s\n👀 Lượng Xem: ${toTinyNumber(tiktok.views)}\n👍 Lượt Thích: ${toTinyNumber(tiktok.love)}\n💬 Lượt Bình Luận: ${toTinyNumber(tiktok.comments)}\n🔀 Lượt Chia Sẻ: ${toTinyNumber(tiktok.share)}\n📥 Lượt Tải: ${toTinyNumber(tiktok.download)}\n🎧 Nhạc Gốc: ${tiktok.name_music}\n👤 Tác Giả Music: ${tiktok.author}`,
                    attachment: fs.createReadStream(filePath!),
                  };
                  const stats = fs.statSync(filePath!);
                  if (!stats)
                    return api.sendMessage(
                      "Lỗi không thể tải video",
                      event.threadID,
                      event.messageID,
                    );
                  const fileSizeInBytes = stats.size;
                  const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
                  if (~~fileSizeInMegabytes > 70)
                    return api.sendMessage(
                      `Video quá nặng không thể gửi (${~~fileSizeInMegabytes}MB)`,
                      event.threadID,
                      event.messageID,
                    );

                   api.setMessageReaction("✅", event.messageID, () => {}, true);
                  api.sendMessage(
                    msg,
                    event.threadID,
                    (error: any) => {
                      if (error)
                        return api.sendMessage(
                          "Lỗi gửi video không thành công",
                          event.threadID,
                          event.messageID,
                        );
                      try {
                        setTimeout(() => {
                          fs.unlinkSync(filePath!);
                        }, 15 * 1000);
                      } catch (err) {
                        console.error(err);
                      }
                    },
                    event.messageID,
                  );
                } catch (error) {
                  api.setMessageReaction("❌", event.messageID, () => {}, true);
                  console.log("Download failed", error);
                }
              } else if (tiktok.images) {
                const file = [];
                const file_Path: fs.PathLike[] | (string | null)[] = [];
                const fileID = id; // This id is not defined. Please provide a valid id.

                api.setMessageReaction("📥", event.messageID, () => {}, true);
                for (let i = 0; i < tiktok.images.length; i++) {
                  const downloader = new Downloader({
                    url: tiktok.images[i],
                    directory: "./.temp",
                  });

                  const { filePath, downloadStatus } = await downloader.download();
                  fs.renameSync(filePath!, `./.temp/${fileID}_${i}.png`);
                  file.push(fs.createReadStream(`./.temp/${fileID}_${i}.png`));
                  file_Path.push(`./.temp/${fileID}_${i}.png`);
                }

                const downloader = new Downloader({
                  url: tiktok.music,
                  directory: "./.temp",
                });

                const { filePath, downloadStatus } = await downloader.download();
                file_Path.push(filePath!);

  api.setMessageReaction("✅", event.messageID, () => {}, true);

                var msgArray = {
                  body: `📺 Kênh: ${tiktok.name}\n🔗 URL: https://www.tiktok.com/@${tiktok.unique}\n📝 Tiêu Đề: ${!tiktok.title ? "" : tiktok.title + "\n"}⛳ Quốc Gia: ${tiktok.region}\n⏱️ Thời Gian Load: ${tiktok.times}s\n👀 Lượng Xem: ${toTinyNumber(tiktok.views)}\n👍 Lượt Thích: ${toTinyNumber(tiktok.love)}\n💬 Lượt Bình Luận: ${toTinyNumber(tiktok.comments)}\n🔀 Lượt Chia Sẻ: ${toTinyNumber(tiktok.share)}\n📥 Lượt Tải: ${toTinyNumber(tiktok.download)}\n🎧 Nhạc Gốc: ${tiktok.name_music}\n👤 Tác Giả Music: ${tiktok.author}`,
                  attachment: file,
                };

                api.sendMessage(
                  msgArray,
                  event.threadID,
                  (error: any) => {
                    if (error)
                      return api.sendMessage(
                        "Lỗi gửi ảnh không thành công",
                        event.threadID,
                        event.messageID,
                      );
                    api.sendMessage(
                      {
                        body: "",
                        attachment: fs.createReadStream(filePath!),
                      },
                      event.threadID,
                    );
                    try {
                      setTimeout(() => {
                        for (let i = 0; i < file_Path.length; i++) {
                          if (fs.existsSync(file_Path[i]!)) fs.unlinkSync(file_Path[i]!);
                        }
                      }, 15 * 1000);
                    } catch (err) {
                      api.setMessageReaction("❌", event.messageID, () => {}, true);
                      console.error(err);
                    }
                  },
                  event.messageID,
                );
              }
            } catch (err) {
              api.setMessageReaction("❌", event.messageID, () => {}, true);
              console.error(err);
            }
          }
        }
      }
    } catch (e) {
      console.log('Error', e);
    }
  }
}
function urlify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  return text.match(urlRegex);
}
function toTinyNumber(number: number) {
  switch (true) {
    case number >= 1000000:
      return (number / 1000000).toFixed(1) + "M";
    case number >= 1000:
      return (number / 1000).toFixed(1) + "k";
    default:
      return number;
  }
}
async function tiktokDL(url: string) {
  const domain = "https://www.tikwm.com/";
  const res = await axios.post(
    domain + "api/",
    {},
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        // 'cookie': 'current_language=en; _ga=GA1.1.115940210.1660795490; _gcl_au=1.1.669324151.1660795490; _ga_5370HT04Z3=GS1.1.1660795489.1.1.1660795513.0.0.0',
        "sec-ch-ua":
          '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      },
      params: {
        url: url,
        count: 12,
        cursor: 0,
        web: 1,
        hd: 1,
      },
    },
  );

  // console.log(res)

  return {
    code: res.data.code,
    times: res.data.processed_time,
    nowm: domain + res.data.data.play,
    music: domain + res.data.data.music,
    images: res.data.data.images,
    title: res.data.data.title,
    region: res.data.data.region,
    views: res.data.data.play_count,
    love: res.data.data.digg_count,
    comments: res.data.data.comment_count,
    share: res.data.data.share_count,
    unique: res.data.data.author.unique_id,
    name: res.data.data.author.nickname,
    download: res.data.data.download_count,
    name_music: res.data.data.music_info.title,
    author: res.data.data.music_info.author,
  };
}
async function streamURL(url, type) {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    const path = join(__dirname, `/cache/${Date.now()}.${type}`);
    fs.writeFileSync(path, res.data);
    setTimeout(p => fs.unlinkSync(p), 1000 * 60, path);
    return fs.createReadStream(path);
  } catch (error) {
    console.error('Lỗi:', error);
    throw error; 
  }
}
