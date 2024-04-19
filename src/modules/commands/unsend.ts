import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class UnsendCommand {
  static config = {
    name: "unsend",
    version: "1.0.0",
    author: "Lợi NDK-[FIX]",
    createdAt: "",
    description: {
      vi: "Gỡ tin nhắn của bot",
      en: "Unsend bot's message",
    },
    guide: {
      vi: "[prefix]unsend (reply: tin nhắn muốn gỡ của bot)",
      en: "[prefix]unsend (reply: the message you want to unsend)",
    },
  };
  static message = {
    vi: {
      syntaxError: "Vui lòng reply tin nhắn muốn gỡ của bot",
    },
    en: {
      syntaxError: "Please reply the message you want to unsend",
    },
  };

  constructor() {}
  async run({ api, event, getLang }: IPangolinRun) {
    try {
      const currentUserID = await api.getCurrentUserID();
      if (!event.messageReply || event.messageReply.senderID != currentUserID)
        return api.sendMessage(
          getLang("syntaxError"),
          event.threadID,
          () => {},
          event.messageID,
        );
      api.unsendMessage(event.messageReply.messageID);
    } catch (error) {
      let message = await getLang("error");
      if (error instanceof Error) message = error.message;
      console.log(error);
      return api.sendMessage(message, event.threadID);
    }
  }
}
