import * as cache from "memory-cache";
import * as fs from "fs";
import { join } from "path";
import {
  IPangolinListenEvent,
  IPangolinRun,
} from "src/types/type.pangolin-handle";

export default class ShortCommand {
  static config = {
    category: "GROUP",
    name: "short",
    version: "1.0.0",
    author: "Lợi",
    description: {
      vi: "Tạo tin nhắn nhanh",
      en: "Create instant messages",
    },
    guide: {
      vi: "[prefix]short [text1] | [text2]",
      en: "[prefix]short [text1] | [text2]",
    },
  };

  static message = {
    vi: {
      notFound: "Nhóm hiện chưa có short message nào",
      example:
        "Thêm short message với nội dung: [short name] | [content] để thêm shortcut",
      created: "Đã thêm short message với nội dung: $0 - $1",
      list: "Danh sách tin nhắn nhanh của nhóm: \n",
      reply: "\nReply 1 số tương ứng để xoá short message!!",
      isNumber: "Vui lòng reply 1 số!!",
    },
    en: {
      notFound: "The group currently does not have any short messages",
      example:
        "Add a short message with the content: [short name] | [content] to add shortcuts",
      created: "Added short message with content: $0 - $1",
      list: "Group instant message list: \n",
      reply: "\nReply a corresponding number to delete the short message!!",
      isNumber: "Please reply with a number!!",
    },
  };
  constructor(private client) {}
  partDataShort = join(process.cwd(), "/src/db/data/short.json");
  async handleAddShort(threadID, shortName, shortContent) {
    const previousData = await fs.readFileSync(this.partDataShort, "utf8");
    if (!previousData) {
      const newData = [
        {
          shorts: [
            {
              shortName,
              shortContent,
            },
          ],
          threadID,
        },
      ];
      await fs.writeFileSync(this.partDataShort, JSON.stringify(newData), {
        encoding: "utf-8",
      });
    }
    if (previousData) {
      const data = JSON.parse(previousData);
      if (!data.some((item) => item.threadID == threadID)) {
        const newData = data.concat({
          shorts: [
            {
              shortName,
              shortContent,
            },
          ],
          threadID,
        });
        await fs.writeFileSync(this.partDataShort, JSON.stringify(newData), {
          encoding: "utf-8",
        });
      } else {
        const newData = data.map((item) => {
          if (item.threadID == threadID) {
            return {
              shorts: item.shorts.concat({
                shortName,
                shortContent,
              }),
              threadID,
            };
          }
          return item;
        });
        await fs.writeFileSync(this.partDataShort, JSON.stringify(newData), {
          encoding: "utf-8",
        });
      }
    }
  }

  async handleRemoveShort(threadID, index) {
    const previousData = await fs.readFileSync(this.partDataShort, "utf8");
    if (!previousData) {
      const newData = [
        {
          shorts: [],
          threadID,
        },
      ];
      await fs.writeFileSync(this.partDataShort, JSON.stringify(newData), {
        encoding: "utf-8",
      });
    }
    if (previousData) {
      const data = JSON.parse(previousData);
      if (!data.some((item) => item.threadID == threadID)) {
        const newData = data.concat({
          shorts: [],
          threadID,
        });
        await fs.writeFileSync(this.partDataShort, JSON.stringify(newData), {
          encoding: "utf-8",
        });
      } else {
        const newData = data.map((item) => {
          if (item.threadID == threadID) {
            return {
              shorts: item.shorts.filter((_, i) => i != parseInt(index) - 1),
              threadID,
            };
          }
          return item;
        });
        await fs.writeFileSync(this.partDataShort, JSON.stringify(newData), {
          encoding: "utf-8",
        });
      }
    }
  }
  async run({ api, event, client, args, getLang, ThreadData }: IPangolinRun) {
    if (args[1]) {
      const short = (event.body as string).split(args[0])[1].trim().split("|");
      const shortName = short[0].trim();
      const shortContent = short[1].trim();
      if (!shortContent || !shortName) {
        api.sendMessage(getLang("example"), event.threadID);
      }
      this.handleAddShort(event.threadID, shortName, shortContent);
      api.sendMessage(
        getLang("created", shortName, shortContent),
        event.threadID,
      );
    } else {
      const listShortFromThread = await fs.readFileSync(
        this.partDataShort,
        "utf-8",
      );
      if (!listShortFromThread)
        return api.sendMessage(getLang("notFound"), event.threadID);
      const listShortFromThreadArr = JSON.parse(listShortFromThread);
      const DataShort = listShortFromThreadArr.filter(
        (item) => item.threadID == event.threadID,
      );
      if (DataShort[0].shorts.length == 0) {
        return api.sendMessage(getLang("notFound"), event.threadID);
      }
      let smg = await getLang("list");
      listShortFromThreadArr.forEach((item) => {
        if (item.threadID === event.threadID) {
          item.shorts.forEach((itemShort, index) => {
            smg += `[${++index}]. ${itemShort.shortName} - ${itemShort.shortContent}\n`;
          });
        }
      });
      const messageID = await new Promise((resolve, reject) => {
        api.sendMessage(
          smg + getLang("reply"),
          event.threadID,
          (err, info) => {
            if (err) reject(err);
            else resolve(info.messageID);
          },
          event.messageID,
        );
      });
      cache.put("short", messageID);
    }
  }
  async event({ api, event, client, UserData, getLang }: IPangolinListenEvent) {
    const listShortFromThread = await fs.readFileSync(
      this.partDataShort,
      "utf-8",
    );
    if (!listShortFromThread) return;
    const listShortFromThreadArr = JSON.parse(listShortFromThread);
    listShortFromThreadArr.forEach((item) => {
      if (item.threadID == event.threadID) {
        item.shorts.forEach((short) => {
          if (event.body == short.shortName)
            api.sendMessage(short.shortContent, event.threadID);
        });
      }
    });
    if (event.type == "message_reply") {
      if (event.messageReply.messageID == cache.get("short")) {
        const regexNumber = /^-?\d*\.?\d+$/;
        if (!regexNumber.test(event.body as string))
          return api.sendMessage(getLang("isNumber"), event.threadID);
        this.handleRemoveShort(event.threadID, event.body);
      }
    }
  }
}
