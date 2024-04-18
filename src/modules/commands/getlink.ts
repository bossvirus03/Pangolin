import { IPangolinRun } from "src/types/type.pangolin-handle";
import { shorten } from "tinyurl";

export default class GetLinkCommand {
  static config = {
    name: "getLink",
    version: "1.0.0",
    author: "Lợi NDK-[FIX]",
    createdAt: "",
    description:
      "Cách dùng: [prefix]getLink(Reply 1 bức ảnh)\nChức năng: lấy url",
  };

  constructor() {}
  async run({ api, event }: IPangolinRun) {
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
      return api.sendMessage(
        "Vui lòng reply ít nhất 1 hình ảnh!",
        event.threadID,
      );
    } catch (error) {
      let message = "Đã xảy ra lỗi không xác định.";
      if (error instanceof Error) message = error.message;
      console.log(error);
      return api.sendMessage(message, event.threadID);
    }
  }
}
