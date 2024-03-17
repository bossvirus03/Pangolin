export default class UidCommand {
  static config = {
    name: "uid",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
    description: "Lấy uid của 1 người",
  };

  constructor(private client) {}
  async run(api, event, client, args) {
    if (!args[1]) return api.sendMessage(event.senderID, event.threadID);
    const propertyValues = Object.keys(event.mentions);
    propertyValues.forEach((item) => {
      api.sendMessage(item, event.threadID);
    });
  }
}
