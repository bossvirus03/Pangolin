import axios from "axios";
export default class PingCommand {
  static config = {
    name: "test",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
  };

  constructor(private client) {}

  async run(api, event, args) {
    const respose = await axios.get("https://api.publicapis.org/entries");
    console.log(respose);
    api.sendMessage(`helee quang anh ${respose.headers.date}`, event.threadID, event.messageID);
  }

  onload(api, client) {}
}
