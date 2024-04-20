import { IPangolinRun } from "src/types/type.pangolin-handle";
import { shorten } from "tinyurl";

export default class GetLinkCommand {
  static config = {
    category: "TOOL",
    name: "getLink",
    version: "1.0.0",
    author: "Lợi NDK-[FIX]",
    description: {
      vi: "Lấy url [ảnh/video]",
      en: "Get url [photo/video]",
    },
    guide: {
      vi: "[prefix]getLink (reply: [ảnh/video])",
      en: "[prefix]getLink (reply: [photo/video])",
    },
  };
  static message = {
    vi: {
      syntaxError: "Vui lòng reply ít nhất 1 ảnh/video!",
      error: "Đã xảy ra lỗi không xác định.",
    },
    en: {
      syntaxError: "Please reply with at least 1 photo/video!",
      error: "An unknown error has occurred.",
    },
  };

  constructor() {}
  async run({ api, event, getLang }: IPangolinRun) {
    try {
      if (event.type == "message_reply") {
        if (event.messageReply.attachments) {
          let msg: string = "",
            num: number = 1;

          for (let attachments of event.messageReply.attachments) {
            const link = await shorten(attachments.url);
            msg += `${num++}. ${link ? link : attachments.url}\n`;
          }

          return api.sendMessage(
            msg,
            event.threadID,
            (err) => {
              if (err) console.log(err);
            },
            event.messageID,
          );
        }
      }
      return api.sendMessage(getLang("syntaxError"), event.threadID);
    } catch (error) {
      let message = await getLang("error");
      if (error instanceof Error) message = error.message;
      console.log(error);
      return api.sendMessage(message, event.threadID);
    }
  }
}
