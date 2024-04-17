import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class SetNameCommand {
  static config = {
    name: "setname",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description:
      "Cách dùng: [prefix]setname @mention [new name]\nChức năng: Đổi biệt danh của 1 người",
  };

  constructor(private client) {}
  async run({ api, event, client, args }: IPangolinRun) {
    if (!args[1] || !event.mentions)
      return api.sendMessage("Vui lòng tag một người!", event.threadID);
    const nickName = (event.body as string).split(
      Object.values(event.mentions)[0] as string,
    )[1];
    const mention = Object.keys(event.mentions)[0];
    console.log(mention);
    await api.changeNickname(nickName, event.threadID, mention);
    api.sendMessage("Đã đổi tên thành công!", event.threadID);
  }
}
