import * as cache from "memory-cache";

export default class ResendCommand {
  static config = {
    name: "checkCM",
    version: "1.0.0",
    author: "loi",
    createdAt: "13/3/24",
    description: "on/off resend mode",
  };

  constructor(private client) {}
  async run(api, event, client, args) {
    const response = cache.get("command-event-on");
    let smg: string = "";
    if (!response) {
      smg = "không có command event nào đang hoạt động";
    } else {
      response.forEach(
        (item) => (smg += `${item.command} - ${item.threadID}\n`)
      );
    }
    console.log(smg);
    api.sendMessage(smg, event.threadID);
  }
}
