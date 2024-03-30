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

  static message = {
    vi: {
      prefix: "PONG! prefix",
      noPrefix: "PONG! no prefix",
    },
    en: {
      listCommand: "",
    },
  };
  constructor(private client) {}

  run(
    api: Ifca,
    event: IEvent,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang
  ) {
    api.sendMessage(getLang("prefix"), event.threadID);
  }

  noprefix(
    api: Ifca,
    event: IEvent,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang
  ) {
    api.sendMessage(getLang("noPrefix"), event.threadID);
  }
}
