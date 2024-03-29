import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";

export default class UnsendCommand {
  static config = {
    name: "unsend",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description: "Cách dùng: [prefix]unsend(reply tin nhắn bot)",
  };

  constructor(private client) {}
  async run(api: Ifca, event: IEvent, client, args, DataUser, DataThread) {
    if (event.type === "message_reply") {
      api.unsendMessage(event.messageReply.messageID, (err) => {
        api.sendMessage("Chỉ thu hồi được tin nhắn của bot!", event.threadID);
      });
    }
  }
}
