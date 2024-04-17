import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class GetLinkCommand {
  static config = {
    name: "getLink",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description:
      "Cách dùng: [prefix]getLink(Reply 1 bức ảnh)\nChức năng: lấy url",
  };

  constructor(private client) {}
  async run({ api, event, client, args, UserData, ThreadData }: IPangolinRun) {
    if (event.type == "message_reply") {
      if (event.messageReply.attachments) {
        event.messageReply.attachments.forEach((item, index) => {
          api.sendMessage(
            `${++index}. ${item.url}`,
            event.threadID,
            (err) => {
              if (err) console.log(err);
            },
            event.messageID,
          );
        });
      }
      return;
    }
    api.sendMessage("Vui lòng reply ít nhất 1 hình ảnh!", event.threadID);
  }
}
