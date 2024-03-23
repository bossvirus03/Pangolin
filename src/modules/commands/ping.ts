import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";

export default class PingCommand {
  static config = {
    name: "ping",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description: "Cách dùng: [prefix]ping kiểm tra bot còn đang hoạt động?",
  };

  constructor(private client) {}

  run(api: Ifca, event: IEvent, args) {
    api.sendMessage("PONG! prefix", event.threadID);
  }

  noprefix(api: Ifca, event: IEvent, args) {
    api.sendMessage("PONG! no prefix", event.threadID);
  }
}
