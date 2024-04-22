import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class ContactCommand {
  static config = {
    category: "INFO",
    name: "contact",
    version: "1.0.0",
    author: "nguyên blue",
    description: {
      vi: "Lấy thẻ liên hệ?",
      en: "Get contact?",
    },
    guide: {
      vi: "[prefix]contact",
      en: "[prefix]contact",
    },
  };

  constructor(private client) {}

  run({ api, event, args }: IPangolinRun) {
    api.shareContact("", event.senderID, event.threadID);
  }
}
