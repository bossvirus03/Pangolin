import * as cache from "memory-cache";
import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";

export default class CheckCMCommand {
  static config = {
    name: "checkCM",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "13/3/24",
    permission: 2,
    description: {
      vi: "kiểm tra xem có bao nhiêu lênh đạng sử dụng dữ liệu RAM",
      en: "check how many commands have been using data from RAM",
    },
    guide: {
      vi: "[prefix]checkCM",
      en: "[prefix]checkCM",
    },
  };
  static message = {
    vi: {
      check: "không có command event nào đang hoạt động",
    },
    en: {
      check: "No command event is running",
    },
  };
  constructor(private client) {}
  async run({
    api,
    event,
    client,
    args,
    DataUser,
    DataThread,
    UserInThreadData,
    getLang,
  }) {
    const response = cache.get("command-event-on");
    let smg: string = "";
    if (!response) {
      smg = getLang("check");
    } else {
      response.forEach(
        (item) => (smg += `${item.command} - ${item.threadID}\n`)
      );
    }
    console.log(smg);
    api.sendMessage(smg, event.threadID, () => {}, event.messageID);
  }
}
