import * as cache from "memory-cache";
import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";

export default class CheckCMCommand {
  static config = {
    name: "checkCM",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "13/3/24",
    description:
      "Cách dùng: [prefix]checkCM\nChức năng: kiểm tra xem có bao nhiêu lênh đạng sử dụng dữ liệu của memory",
    permission: 2,
  };

  constructor(private client) {}
  async run(api: Ifca, event: IEvent, client, args) {
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
