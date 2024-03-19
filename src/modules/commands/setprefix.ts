export default class SetPrefixCommand {
  static config = {
    name: "setprefix",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
    description: "Đổi prefix của box",
    permission: 1,
  };

  constructor(private client) {}
  async run(api, event, client, args, DataUser, DataThread) {
    await DataThread.setPrefix(event.threadID, args[1]);
    api.sendMessage("Đã đổi prefix thành " + args[1], event.threadID);
  }
}
