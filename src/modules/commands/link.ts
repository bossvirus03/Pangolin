import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class LinkCommand {
  static config = {
    name: "link",
    version: "1.0.0",
    author: "Nguyên blue",
    createdAt: "",
    description:
      "Cách dùng: [prefix]link or [prefix]link @mentions\nChức năng: Lấy link của mình hoặc của người khác",
  };

  constructor(private client) {}
  async run({ api, event, client, args }: IPangolinRun) {
    if (!args[1]) return api.sendMessage(event.senderID, event.threadID);
    const propertyValues = Object.keys(event.mentions);
    propertyValues.forEach((item) => {
      api.sendMessage(
        `https://www.facebook.com/profile.php?id=${item}`,
        event.threadID,
      );
    });
  }
}
