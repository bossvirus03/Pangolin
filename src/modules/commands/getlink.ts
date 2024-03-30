import axios from "axios";
import * as fs from "fs";
import { join } from "path";
import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";

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
  async run(api: Ifca, event: IEvent, client, args, DataUser, DataThread) {
    if (event.type == "message_reply") {
      if (event.messageReply.attachments) {
        event.messageReply.attachments.forEach((item, index) => {
          api.sendMessage(
            `${++index}. ${item.url}`,
            event.threadID,
            (err) => {
              if (err) console.log(err);
            },
            event.messageID
          );
        });
      }
      return;
    }
    api.sendMessage("Vui lòng reply ít nhất 1 hình ảnh!", event.threadID);
  }
}
