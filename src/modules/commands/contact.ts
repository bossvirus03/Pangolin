import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class ContactCommand {
  static config = {
    name: "contact",
    version: "1.0.0",
    author: "nguyên blue",
    createdAt: "",
    description: "Cách dùng: [prefix]contact để lấy thẻ liên hệ?",
  };

  constructor(private client) {}

  run({ api, event, args }: IPangolinRun) {
    api.shareContact("", event.senderID, event.threadID);
  }
}
