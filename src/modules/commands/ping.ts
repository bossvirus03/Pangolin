export default class PingCommand {
  static config = {
    name: "ping",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description: "Cách dùng: [prefix]ping kiểm tra bot còn đang hoạt động?",
  };

  constructor(private client) {}

  run(api, event, args) {
    api.sendMessage("PONG! prefix", event.threadID, event.messageID);
  }

  noprefix(api, event, args) {
    api.sendMessage("PONG! no prefix", event.threadID, event.messageID);
  }
}
