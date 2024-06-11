import { join } from "path";
import fs from "fs";
import axios from "axios";
import * as ytdl from "@distube/ytdl-core";
import cheerio from "cheerio";
import {
  IPangolinHandleEvent,
  IPangolinRun,
} from "src/types/type.pangolin-handle";
async function aio_video(url) {
  try {
    const yanz = await axios.get("https://davapps.com/");
    const $ = cheerio.load(yanz.data);
    const tokens = $("input[name='token']").val();
    const data = new URLSearchParams(
      Object.entries({
        url: url,
        token: tokens,
        hash: await generateRandomToken(),
      }),
    );
    // https://vidburner.com
    // https://videovil.com
    const response = await axios.post(
      "https://davapps.com/wp-json/aio-dl/video-data/",
      data,
      {
        headers: {
          cookie:
            "pll_language=en; cf_clearance=byJ6Sqw_TAWzYqPc_xx8TZ0MFLgjZ7ZQzc7ZYMh8DFk-1694328031-0-1-83cb9e5b.e7348ce9.f4d71b98-0.2.1694328031; PHPSESSID=a56b01c9c093f4a3c6f1aee4282954e6",
          Referer: "https://davapps.com/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
async function generateRandomToken() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  const base64Token = btoa(token);
  const finalToken =
    "aHR0cHM6Ly92dC50aWt0b2suY29tL1pTRk1CTkNnbi8=" + base64Token;
  return finalToken;
}

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
      listSocialSupported: `› Status: turned ON`,
      listSocialSupporte: `› Status: turned OFF`,
      listSocialHelp: `Supported Websites\n\n9GAG, Bandcamp, Bitchute, Buzzfeed, Capcut, Chingari, Dailymotion, Douyin, Akilli TV, ESPN, Facebook, Febspot, Flickr, Ifunny, IMDB, Imgur, Instagram, Izlesene, Likee, LinkedIn, Loom, Mashable, Mastodon, Mixcloud, Moj, MxTakatak, Ok.ru, Pinterest, PuhuTV, Reddit, Rumble, Share Chat, Snapchat, Soundcloud, Streamable, Substack, TED, Telegram, Threads, Tiktok, Tumblr, Twitch, Vimeo, spotify, VK, YouTube, Twitter`,
      invalidCommand:
        "Lệnh không hợp lệ. Vui lòng sử dụng 'autodown on' hoặc 'autodown off'.",
    },
    en: {
      listSocialSupported: `› Status: turned ON`,
      listSocialSupporte: `› Status: turned OFF`,
      listSocialHelp: `Supported Websites\n\n9GAG, Bandcamp, Bitchute, Buzzfeed, Capcut, Chingari, Dailymotion, Douyin, Akilli TV, ESPN, Facebook, Febspot, Flickr, Ifunny, IMDB, Imgur, Instagram, Izlesene, Likee, LinkedIn, Loom, Mashable, Mastodon, Mixcloud, Moj, MxTakatak, Ok.ru, Pinterest, PuhuTV, Reddit, Rumble, Share Chat, Snapchat, Soundcloud, Streamable, Substack, TED, Telegram, Threads, Tiktok, Tumblr, Twitch, Vimeo, spotify, VK, YouTube, Twitter`,
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
          await api.sendMessage(getLang("listSocialSupporte"), event.threadID);
        }
      } else if (args[1] === "help") {
        await api.sendMessage(getLang("listSocialHelp"), event.threadID);
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
                  body: `${res.message || "Không Có Tiêu Đề"}\n`,
                  attachment,
                },
                event.threadID,
              );
            }
          } else if (/tiktok|douyin/.test(url)) {
            setTimeout(() => {}, 10000);
            const res = (
              await axios.get(`https://www.tikwm.com/api/?url=${url}`)
            ).data;
            let attachment = [];
            if (res.data) {
              if (res.data.play && !res.data.images) {
                const path = join(
                  process.cwd(),
                  `/public/videos/${Date.now()}.mp4`,
                );
                await axios
                  .get(res.data.play, {
                    responseType: "arraybuffer",
                  })
                  .then((response) => {
                    const buffer = Buffer.from(response.data);
                    fs.writeFileSync(path, buffer);
                    attachment.push(fs.createReadStream(path));
                  });
              }
              if (res.data.images) {
                let index = 0;
                for (const item of res.data.images) {
                  index++;
                  const path = join(
                    process.cwd(),
                    `/public/images/${index}.jpg`,
                  );
                  await axios
                    .get(item, {
                      responseType: "arraybuffer",
                    })
                    .then((response) => {
                      const buffer = Buffer.from(response.data);
                      fs.writeFileSync(path, buffer);
                      attachment.push(fs.createReadStream(path));
                    });
                }
              }

              await api.sendMessage(
                {
                  body: `${res.data.title || "Không Có Tiêu Đề"}\n`,
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
                  body: `${res.message || "Không Có Tiêu Đề"}\n`,
                  attachment,
                },
                event.threadID,
              );
            }
          } else if (/capcut/.test(url)) {
            const getUrlResponse = await axios.get(
              `https://ssscap.net/api/download/get-url?url=${url}`,
            );
            const videoId = getUrlResponse.data.url.split("/")[4].split("?")[0];
            const options = {
              method: "GET",
              url: `https://ssscap.net/api/download/${videoId}`,
              headers: {
                Connection: "keep-alive",
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
                Cookie:
                  "sign=08321c1cc11dbdd2d6e3c63f44248dcf; device-time=1699454542608",
                Referer: "https://ssscap.net/vi",
                Host: "ssscap.net",
                "Accept-Language": "vi-VN,vi;q=0.9",
                Accept: "application/json, text/plain, */*",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Site": "same-origin",
                "Sec-Fetch-Mode": "cors",
              },
            };

            const response = await axios.request(options);
            const { title, description, usage, originalVideoUrl } =
              response.data;
            const link = `https://ssscap.net${originalVideoUrl}`;
            if (link) {
              await api.sendMessage(
                {
                  body: `${title || "Không Có Tiêu Đề"}\n${description || "Không Có Mô Tả"}`,
                  attachment: await streamURL(link, "mp4"),
                },
                event.threadID,
              );
            }
          } else if (/9gag/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/bandcamp/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/linkedin/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/spotify/.test(url)) {
            const result = (
              await axios.get(
                `https://apis-samir.onrender.com/spotifydl?url=${url}`,
              )
            ).data;
            if (result.link) {
              await api.sendMessage(
                {
                  body: `${result.metadata.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(result.link, "mp3"),
                },
                event.threadID,
              );
            }
          } else if (/izlesene/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/imgur/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/imdb/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/bitchute/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/x|tw|twitter/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/vk/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/vimeo/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/twitch/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/tumblr/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/telegram/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/ted/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/substack/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/streamable/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/soundcloud/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/snapchat/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/sharechat/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/rumble/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/reddit/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/puhutv/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/mxtakatak/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/moj/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/mixcloud/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/mastodon/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/mashable/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/loom/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/ifunny/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/buzzfeed/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/ok/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/dailymotion|dai/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/espn/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/febspot/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/flic|flickr/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/akilli/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/likee/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
                },
                event.threadID,
              );
            }
          } else if (/chingari/.test(url)) {
            const result = await aio_video(url);
            if (result.medias[0].url) {
              await api.sendMessage(
                {
                  body: `${result.title || "Không Có Tiêu Đề"}`,
                  attachment: await streamURL(
                    result.medias[0].url,
                    result.medias[0].extension,
                  ),
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
                  body: `${res.message || "Không Có Tiêu Đề"}\n`,
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
