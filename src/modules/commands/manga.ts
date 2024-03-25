import axios from "axios";
import * as cache from "memory-cache";
import * as cheerio from "cheerio";
import * as fs from "fs";
import { join } from "path";
import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
export default class MangaCommand {
  static config = {
    name: "manga",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description:
      "Cách dùng: [prefix]manga [tên truyện cần tìm]\nChức năng: đọc truyện",
  };

  constructor(private client) {}
  async event(api: Ifca, event: IEvent, client) {
    const listManga = cache.get("manga");
    if (event.type == "message_reply") {
      let numChose = 1;
      //reply list manga
      if (listManga) {
        listManga.forEach((item) => {
          if (event.messageReply.messageID == item.messageID) {
            item.data.forEach((itemData) => {
              if (event.body == numChose) {
                axios(itemData.href).then((res) => {
                  const html = res.data;
                  const $ = cheerio.load(html);
                  let chapters = [];
                  $("ul li .col-xs-5", html).each(function () {
                    const link = $(this).find("a").attr("href");
                    chapters.push(link);
                  });
                  api.sendMessage(
                    `Có ${chapters.length} chapter, vui lòng reply để chọn chap cần đọc!`,
                    event.threadID,
                    (err, res) => {
                      cache.put(
                        "manga-list-chapter",
                        { data: chapters, messageID: res.messageID },
                        5 * 1000 * 60
                      );
                    }
                  );
                });
              }
              numChose++;
            });
          }
        });
      }
      // reply list chapter
      const listChapter = cache.get("manga-list-chapter");
      if (listChapter) {
        let chapterIndex = 1;
        if (event.messageReply.messageID == listChapter.messageID) {
          listChapter.data.reverse().forEach((chapter) => {
            if (event.body == chapterIndex) {
              axios(chapter).then(async (res) => {
                const html = res.data;
                const $ = cheerio.load(html);
                let imgChapters = [];
                let promises = [];
                let numOfImgChapter = 1;
                $(".reading .reading-detail .page-chapter", html).each(
                  function () {
                    const link = $(this).find("img").attr("data-original");
                    var ext = link.substring(link.lastIndexOf(".") + 1);
                    const path = join(
                      process.cwd(),
                      `/public/images/${numOfImgChapter}.${ext}`
                    );
                    // Create a promise for each image download
                    const promise = axios
                      .get(link, { responseType: "arraybuffer" })
                      .then((response) => {
                        const buffer = Buffer.from(response.data);
                        fs.writeFileSync(path, buffer);
                        imgChapters.push(fs.createReadStream(path));
                      })
                      .catch((error) => {
                        console.error("Error downloading image:", error);
                      });
                    promises.push(promise);
                    numOfImgChapter++;
                  }
                );

                // Wait for all promises to resolve
                Promise.all(promises)
                  .then(() => {
                    // All images are downloaded, send the message
                    api.sendMessage(
                      {
                        attachment: imgChapters,
                        body: `Có ${imgChapters.length} trang ở chap này. Chúc bạn đọc vui vẻ :D`,
                      },
                      event.threadID
                    );
                  })
                  .catch((error) => {
                    console.error("Error downloading images:", error);
                  });
              });
            }
            chapterIndex++;
          });
        }
      }
    }
  }
  async run(api: Ifca, event: IEvent, client, args) {
    const search = (event.body as string).split(args[0])[1].trim();
    try {
      const response = await axios.get(
        "https://nettruyenfull.com/suggest-search",
        {
          params: {
            q: search,
          },
        }
      );

      const rawLinks = response.data.split("<a");

      let result = rawLinks.map((rawLink) => {
        const hrefStart = rawLink.indexOf('href="') + 6;
        const hrefEnd = rawLink.indexOf('"', hrefStart);
        const href = rawLink.slice(hrefStart, hrefEnd);

        const titleStart = rawLink.indexOf("h3>") + 3;
        const titleEnd = rawLink.indexOf("<", titleStart);
        const title = rawLink.slice(titleStart, titleEnd);

        const imgStart = rawLink.indexOf('src="') + 5;
        const imgEnd = rawLink.indexOf('"', imgStart);
        const thumbnail = rawLink.slice(imgStart, imgEnd);

        return { href, title, thumbnail };
      });

      result = result.filter((item) => !item.href.startsWith(" "));

      let smg = "";
      let i = 1;
      result.forEach((item) => {
        smg += `[${i}] ${item.title} \n${item.href}\n\n`;
        i++;
      });
      smg += "Reply số tương ứng để chọn";
      api.sendMessage(smg, event.threadID, async (err, res) => {
        const MangaChose = [];
        MangaChose.push({
          messageID: res.messageID,
          threadID: res.threadID,
          data: result,
        });
        cache.put("manga", MangaChose, 10000 * 60);
      });
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  }
}
