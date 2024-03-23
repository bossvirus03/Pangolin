import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";

export default class SetPrefixCommand {
  static config = {
    name: "setprefix",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description:
      "Cách dùng: [prefix]setprefix [prefix]\nChức năng: Đổi prefix của box",
    permission: 1,
  };

  constructor(private client) {}
  async run(api: Ifca, event: IEvent, client, args, DataUser, DataThread) {
    await DataThread.setPrefix(event.threadID, args[1]);
    api.sendMessage("Đã đổi prefix thành " + args[1], event.threadID);
  }
}
