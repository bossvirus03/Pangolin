import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class UnsendCommand {
  static config = {
    name: "unsend",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description: "Cách dùng: [prefix]unsend(reply tin nhắn bot)",
  };

  constructor(private client) {}
  async run({ api, event, client, args, UserData, ThreadData }: IPangolinRun) {
    if (event.type === "message_reply") {
      api.unsendMessage(event.messageReply.messageID, (err) => {
        api.sendMessage("Chỉ thu hồi được tin nhắn của bot!", event.threadID);
      });
    }
  }
}
