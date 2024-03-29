import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import * as Downloader from "nodejs-file-downloader";
import * as Gemini from "gemini-ai";
import * as fs from "fs";

export default class GeminiCommand {
  static config = {
    name: "g",
    version: "1.0.0",
    author: "Nguyên Blue",
    createdAt: "",
    description:
      "Cách dùng: [prefix]gemini text hoặc [prefix]gemini text reply\nChức năng: chat với trí tuệ nhân tạo của Gemini",
  };

  constructor(private client) {}

  async run(api: Ifca, event: IEvent, args) {
    try {
      const gemini = new Gemini(process.env.GEMINI_API_KEY);

      if (
        event.type == "message_reply" &&
        event.messageReply &&
        event.messageReply.attachments.length > 0
      ) {
        let files: Buffer[] = [];

        if (event.messageReply.attachments) {
          event.messageReply.attachments.forEach((item) => {
            api.sendMessage(item.url, event.threadID, event.messageID);
          });
        }

        api.setMessageReaction("✨", event.messageID, () => {}, true);

        let msg =
          args.join(" ") === ""
            ? `Giải thích ${
                event.messageReply!.attachments.length === 1
                  ? "bức"
                  : event.messageReply!.attachments.length + "bức"
              } ảnh này`
            : args.join(" ");

        for (const attachment of event.messageReply!.attachments) {
          if (attachment.type !== "photo") return;
          const downloader = new Downloader({
            url: attachment.url,
            directory: "./.temp",
          });
          const { filePath, downloadStatus } = await downloader.download();
          files.push(fs.readFileSync(filePath!));
        }

        let content = await gemini.ask(msg, {
          data: files,
        });

        api.sendMessage(content, event.threadID, event.messageID);
        api.setMessageReaction("", event.messageID);
      } else {
        let msg = args.join(" ");

        if (msg === "")
          return api.sendMessage(
            "Bạn phải ghi tin nhắn hoặc trả lời lại ảnh",
            event.threadID,
            event.messageID
          );

        api.setMessageReaction("✨", event.messageID, () => {}, true);

        let content = await gemini.ask(msg);

        api.sendMessage(content, event.threadID, event.messageID);
        api.setMessageReaction("", event.messageID);
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
  }
}
