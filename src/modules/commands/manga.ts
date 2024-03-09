export default class PingCommand {
    static config = {
      name: "ping",
      version: "1.0.0",
      author: "loi",
      createdAt: "",
    };
  
    constructor(private client) {}
  
    run(api, event, args) {
      api.sendMessage("PONG! prefix", event.tAhreadID, event.messageID);
    }
  
    noprefix(api, event, args) {
      // Your noprefix logic here
      api.sendMessage("PONG! no prefix", event.threadID, event.messageI);
    }
  
    onload(api, client) {
    }
  }
  