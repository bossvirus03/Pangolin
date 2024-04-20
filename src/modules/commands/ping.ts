import {
  IPangolinNoprefix,
  IPangolinRun,
} from "src/types/type.pangolin-handle";

export default class PingCommand {
  static config = {
    category: "",
    name: "ping",
    version: "1.0.0",
    author: "Lợi",

    description: {
      vi: "kiểm tra bot còn đang hoạt động?",
      en: "kiểm tra bot còn đang hoạt động?",
    },
    guide: {
      vi: "[prefix]ping",
      en: "[prefix]ping",
    },
  };

  static message = {
    vi: {
      prefix: "PONG! prefix",
      noPrefix: "PONG! no prefix",
    },
    en: {
      prefix: "PONG! prefix",
      noPrefix: "PONG! no prefix",
    },
  };
  constructor(private client) {}

  run({
    api,
    event,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
  }: IPangolinRun) {
    api.sendMessage(getLang("prefix"), event.threadID);
  }

  noprefix({
    api,
    event,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
  }: IPangolinNoprefix) {
    api.sendMessage(getLang("noPrefix"), event.threadID);
  }
}
