import { join } from "path";
import fs from "fs";
import axios from "axios";
import * as ytdl from "@distube/ytdl-core";
import {
  IPangolinHandleEvent,
  IPangolinRun,
} from "src/types/type.pangolin-handle";

function urlify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = text.match(urlRegex);
  if (matches && matches.length > 0) {
    return matches;
  } else {
    return;
  }
}

const _108MB = 108 * 1024 * 1024;

async function playVideo(api, event, video) {
  const path = join(process.cwd(), `/public/videos/${Date.now()}.mp4`);
  const videoUrl = video.formats.filter(
    (item) =>
      item.hasAudio == true &&
      item.hasAudio == true &&
      item.quality == "medium",
  )[0].url;
  try {
    const { videoId, title } = video.player_response.videoDetails;
    ytdl.getInfo(videoId).then((res) => {
      if (parseInt(res.videoDetails.lengthSeconds) > 900) {
        api.sendMessage(
          "Xin lỗi video này quá dài bạn vui lòng tự nhấn xem tại: " +
            "https://www.youtube.com/watch?v=" +
            videoId,
          event.threadID,
        );
        return;
      }
      axios.get(videoUrl, { responseType: "arraybuffer" }).then((res) => {
        const buffer = Buffer.from(res.data);
        fs.writeFileSync(path, buffer);
        video = fs.createReadStream(path);
        api.sendMessage(
          {
            attachment: video,
            body: title,
          },
          event.threadID,
        );
      });
    });
  } catch (err) {
    console.error(err);
    await api.sendMessage("An error occurred");
  } finally {
    try {
      if (fs.existsSync(path)) fs.unlinkSync(path);
    } catch (err) {
      console.error(err);
    }
  }
}

async function getVideoInfo(url) {
  try {
    const video_info = await ytdl.getInfo(url[0]);
    if (video_info && video_info.videoDetails) {
      return video_info;
    } else {
      console.error("Không thể lấy thông tin video.");
      return null;
    }
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function streamURL(url, type) {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    const path = join(process.cwd(), `/public/videos/${Date.now()}.${type}`);
    fs.writeFileSync(path, res.data);
    setTimeout(() => fs.unlinkSync(path), 1000 * 60); // Xóa file sau 1 phút
    return fs.createReadStream(path);
  } catch (error) {
    console.error("Lỗi:", error);
    throw error;
  }
}

export default class autodown {
  static config = {
    category: "MEDIA",
    name: "autodown",
    version: "1.0.0",
    author: "Nguyên Blue",
    description: {
      vi: "Tự động tải (video/hình ảnh) mạng xã hội",
      en: "Automatically download (videos/images) to social networks",
    },
    guide: {
      vi: "[prefix]autodown",
      en: "[prefix]autodown",
    },
  };
  static message = {
    vi: {
      listSocialSupported: `
      〈 Autodown Social Network 〉
      ╭─────────────⭓
      │› Status: turned ON
      │› Tiktok: ✅
      │› Douyin: ✅
      │› Instagram: ✅
      │› Threads: ✅
      │› Facebook: ✅
      │› Pinterest: ✅
      │› Capcut: ✅
      │› Soundcloud: ✅
      │› Spotify: ✅
      │› Zingmp3: ✅
      │› WhatsApp: ❎
      │› YouTube: ✅
      │› Weibo: ❎
      │› Twitter: ✅
      │› Kuaishou: ✅
      │› Reddit: ❎
      ╰─────────────⭓
      `,
      invalidCommand:
        "Lệnh không hợp lệ. Vui lòng sử dụng 'autodown on' hoặc 'autodown off'.",
    },
    en: {
      listSocialSupported: `
      〈 Autodown Social Network 〉
      ╭─────────────⭓
      │› Status: turned ON
      │› Tiktok: ✅
      │› Douyin: ✅
      │› Instagram: ✅
      │› Threads: ✅
      │› Facebook: ✅
      │› Pinterest: ✅
      │› Capcut: ✅
      │› Soundcloud: ✅
      │› Spotify: ✅
      │› Zingmp3: ✅
      │› WhatsApp: ❎
      │› YouTube: ✅
      │› Weibo: ❎
      │› Twitter: ✅
      │› Kuaishou: ✅
      │› Reddit: ❎
      ╰─────────────⭓
      `,
      invalidCommand:
        "Invalid order. Please use 'autodown on' or 'autodown off'.",
    },
  };

  constructor(private client) {}

  async run({ api, event, args, getLang }: IPangolinRun) {
    try {
      const duongdan = join(process.cwd(), `/src/db/data/autodown.json`);
      if (args[1] === "on") {
        fs.writeFileSync(duongdan, "on", "utf8");
        await api.sendMessage(getLang("listSocialSupported"), event.threadID);
      } else if (args[1] === "off") {
        const fileExists = fs.existsSync(duongdan);
        if (fileExists) {
          fs.writeFileSync(duongdan, "off", "utf8");
          await api.sendMessage(getLang("listSocialSupported"), event.threadID);
        }
      } else {
        await api.sendMessage(getLang("invalidCommand"), event.threadID);
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
  }

  async handleEvent({ api, event, client }: IPangolinHandleEvent) {
    try {
      const encoding = "utf8";
      const duongdan = join(process.cwd(), `/src/db/data/autodown.json`);
      const content = fs.readFileSync(duongdan, encoding).trim().toLowerCase();
      if (content === "on") {
        if (!event.body || typeof event.body !== "string") return;
        const url = urlify(event.body);
        if (url) {
          if (/youtube|youtu/.test(url)) {
            try {
              const videoInfo = await getVideoInfo(url);
              if (videoInfo) {
                await playVideo(api, event, videoInfo);
              }
            } catch (err) {
              console.error(err);
            }
          } else if (/fb|facebook/.test(url)) {
            const res = (
              await axios.get(
                `https://j2download.net/api/facebook/media?url=${url}`,
              )
            ).data;
            if (res.attachments && res.attachments.length > 0) {
              const attachment = await Promise.all(
                res.attachments.map(async (facebook) => {
                  if (facebook.type === "Video") {
                    const videoUrl = facebook.url.sd || facebook.url.hd;
                    return await streamURL(videoUrl, "mp4");
                  } else if (facebook.type === "Photo") {
                    return await streamURL(facebook.url, "jpg");
                  }
                }),
              );
              await api.sendMessage(
                {
                  body: `〈 Autodown Social Network 〉\n${res.message || "Không Có Tiêu Đề"}\n`,
                  attachment,
                },
                event.threadID,
              );
            }
          } else if (/ig|instagam|threads/.test(url)) {
            const res = (
              await axios.get(
                `https://j2download.net/api/instagram/media?url=${url}`,
              )
            ).data;
            let attachment = [];
            if (res.attachments && res.attachments.length > 0) {
              if (res.attachments[0].type === "Video") {
                for (const Instagram of res.attachments) {
                  const videoUrl = Instagram.url;
                  attachment.push(await streamURL(videoUrl, "mp4"));
                }
              } else if (res.attachments[0].type === "Photo") {
                for (const attachmentItem of res.attachments) {
                  const urlImg = attachmentItem.url;
                  attachment.push(await streamURL(urlImg, "jpg"));
                }
              }
              await api.sendMessage(
                {
                  body: `〈 Autodown Social Network 〉\n${res.message || "Không Có Tiêu Đề"}\n`,
                  attachment,
                },
                event.threadID,
              );
            }
          } else if (/capcut/.test(url)) {
            const res = (
              await axios.get(
                `https://apichatbot.sumiproject.io.vn/capcutdowload?url=${url}`,
              )
            ).data;
            if (res.video) {
              await api.sendMessage(
                {
                  body: `〈 Autodown Social Network 〉\n${res.title || "Không Có Tiêu Đề"}\n${res.description || "Không Có Mô Tả"}`,
                  attachment: await streamURL(res.video, "mp4"),
                },
                event.threadID,
              );
            }
          } else if (/soundcloud/.test(url)) {
            const res = (
              await axios.get(
                `https://sumiproject.io.vn/soundcloud/dowload?link=${url}`,
              )
            ).data;
            if (res.audio[0].url) {
              await api.sendMessage(
                {
                  body: `〈 Autodown Social Network 〉\n${res.title || "Không Có Tiêu Đề"}\n`,
                  attachment: await streamURL(res.audio[0].url, "mp3"),
                },
                event.threadID,
              );
            }
          } else if (/twitter|tw|x/.test(url)) {
            const res = (
              await axios.get(
                `https://nguyenmanh.name.vn/api/twitterDL?url=${url}&apikey=AVny3Riw`,
              )
            ).data;
            if (res.result.SD) {
              await api.sendMessage(
                {
                  body: `〈 Autodown Social Network 〉\n`,
                  attachment: await streamURL(res.result.SD, "mp4"),
                },
                event.threadID,
              );
            }
          } else if (/spotify/.test(url)) {
            const res = (
              await axios.get(
                `https://nguyenmanh.name.vn/api/spDL?url=${url}&apikey=AVny3Riw`,
              )
            ).data;
            if (res.result.preview_audio) {
              await api.sendMessage(
                {
                  body: `〈 Autodown Social Network 〉\n${res.result.name || "Không Có Tiêu Đề"}\n`,
                  attachment: await streamURL(res.result.preview_audio, "mp3"),
                },
                event.threadID,
              );
            }
          } else if (/mp3|zing/.test(url)) {
            const res = await axios.get(
              `https://nguyenmanh.name.vn/api/zMp3DL?url=${url}&apikey=AVny3Riw`,
            );
            if (res.data.result) {
              await api.sendMessage(
                {
                  body: `〈 Autodown Social Network 〉\n`,
                  attachment: await streamURL(res.data.result, "mp3"),
                },
                event.threadID,
              );
            }
          } else if (/kuaishou/.test(url)) {
            const res = (
              await axios.get(
                `https://nguyenmanh.name.vn/api/kuaishou?url=${url}&apikey=jddAywUs`,
              )
            ).data;
            if (res.result.videonowatermark) {
              await api.sendMessage(
                {
                  body: `〈 Autodown Social Network 〉\n${res.result.photo.caption || "Không Có Tiêu Đề"}\n`,
                  attachment: await streamURL(
                    res.result.videonowatermark,
                    "mp4",
                  ),
                },
                event.threadID,
              );
            }
          } else if (/tiktok|douyin/.test(url)) {
            const res = (
              await axios.get(
                `https://j2download.net/api/tiktok/media?url=${url}`,
              )
            ).data;
            let attachment = [];
            if (res.attachments && res.attachments.length > 0) {
              if (res.attachments[0].type === "Video") {
                const videoUrl = res.attachments[0].url;
                attachment.push(await streamURL(videoUrl, "mp4"));
              } else if (res.attachments[0].type === "Photo") {
                for (const attachmentItem of res.attachments) {
                  const urlImg = attachmentItem.url;
                  attachment.push(await streamURL(urlImg, "jpg"));
                }
              }
              await api.sendMessage(
                {
                  body: `〈 Autodown Social Network 〉\n${res.message || "Không Có Tiêu Đề"}\n`,
                  attachment,
                },
                event.threadID,
              );
            }
          } else if (/pin|pinterest/.test(url)) {
            const res = (
              await axios.get(
                `https://j2download.net/api/pinterest/media?url=${url}`,
              )
            ).data;
            let attachment = [];
            if (res.attachments && res.attachments.length > 0) {
              if (res.attachments[0].type === "Video") {
                for (const pinterest of res.attachments) {
                  const videoUrl = pinterest.url;
                  attachment.push(await streamURL(videoUrl, "mp4"));
                }
              } else if (res.attachments[0].type === "Photo") {
                for (const attachmentItem of res.attachments) {
                  const urlImg = attachmentItem.url;
                  attachment.push(await streamURL(urlImg, "jpg"));
                }
              } else if (res.attachments[0].type === "Gif") {
                for (const attachmentItems of res.attachments) {
                  const urlgif = attachmentItems.url;
                  attachment.push(await streamURL(urlgif, "gif"));
                }
              }
              await api.sendMessage(
                {
                  body: `〈 Autodown Social Network 〉\n${res.message || "Không Có Tiêu Đề"}\n`,
                  attachment,
                },
                event.threadID,
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
  }
}
