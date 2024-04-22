import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class SetPrefixCommand {
  static config = {
    category: "GROUP",
    name: "setprefix",
    version: "1.0.0",
    author: "Lợi",
    permission: 1,
    description: {
      vi: "Đổi prefix của box",
      en: "Change the box's prefix",
    },
    guide: {
      vi: "[prefix]setprefix [new prefix]",
      en: "[prefix]setprefix [new prefix]",
    },
  };

  static message = {
    vi: {
      info: "Đã đổi prefix thành $0",
      isGroup: "Chỉ có thể sử dụng trong nhóm!",
    },
    en: {
      info: "Changed prefix to $0",
      isGroup: "Can only be used in groups!",
    },
  };
  constructor(private client) {}
  async run({ api, event, getLang, args, UserData, ThreadData }: IPangolinRun) {
    if (!event.isGroup) {
      return api.sendMessage(getLang("isGroup"), event.threadID);
    }
    await ThreadData.setPrefix(event.threadID, args[1]);
    api.sendMessage(getLang("info", args[1]), event.threadID);
  }
}
