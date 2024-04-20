import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class SetPrefixCommand {
  static config = {
    category: "GROUP",
    name: "setprefix",
    version: "1.0.0",
    author: "Lợi",

    description:
      "Cách dùng: [prefix]setprefix [prefix]\nChức năng: Đổi prefix của box",
    permission: 1,
  };

  constructor(private client) {}
  async run({ api, event, client, args, UserData, ThreadData }: IPangolinRun) {
    if (!event.isGroup) {
      return api.sendMessage("Chỉ có thể sử dụng trong nhóm!", event.threadID);
    }
    await ThreadData.setPrefix(event.threadID, args[1]);
    api.sendMessage("Đã đổi prefix thành " + args[1], event.threadID);
  }
}
