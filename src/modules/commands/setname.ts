import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class SetNameCommand {
  static config = {
    category: "GROUP",
    name: "setname",
    version: "1.0.0",
    author: "Lợi",
    description: {
      vi: "Đổi biệt danh của 1 thành viên",
      en: "Change a member's nickname",
    },
    guide: {
      vi: "[prefix]setname @mention [new name]",
      en: "[prefix]setname @mention [new name]",
    },
  };

  static message = {
    vi: {
      info: "Đã đổi tên thành công!",
    },
    en: {
      info: "Name changed successfully!",
    },
  };
  constructor(private client) {}
  async run({ api, event, getLang, args }: IPangolinRun) {
    if (!args[1] || !event.mentions)
      return api.sendMessage("Vui lòng tag một người!", event.threadID);
    const nickName = (event.body as string).split(
      Object.values(event.mentions)[0] as string,
    )[1];
    const mention = Object.keys(event.mentions)[0];
    console.log(mention);
    await api.changeNickname(nickName, event.threadID, mention);
    api.sendMessage(getLang("info"), event.threadID);
  }
}
