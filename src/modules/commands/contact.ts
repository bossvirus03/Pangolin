import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class ContactCommand {
  static config = {
    category: "INFO",
    name: "contact",
    version: "1.0.0",
    author: "nguyên blue",
    description: "Cách dùng: [prefix]contact để lấy thẻ liên hệ?",
  };

  constructor(private client) {}

  run({ api, event, args }: IPangolinRun) {
    api.shareContact("", event.senderID, event.threadID);
  }
}
