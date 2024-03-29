import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";

export default class UidCommand {
  static config = {
    name: "uid",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description:
      "Cách dùng: [prefix]uid or [prefix]uid @mentions\nChức năng: Lấy uid của mình hoặc của người khác",
  };

  constructor(private client) {}
  async run(api: Ifca, event: IEvent, client, args) {
    if (!args[1]) return api.sendMessage(event.senderID, event.threadID);
    const propertyValues = Object.keys(event.mentions);
    propertyValues.forEach((item) => {
      api.sendMessage(item, event.threadID);
    });
  }
}
