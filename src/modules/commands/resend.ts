import axios from "axios";
import * as cache from "memory-cache";
import * as fs from "fs";
import { join } from "path";

import {
  IPangolinListenEvent,
  IPangolinRun,
} from "src/types/type.pangolin-handle";

export default class ResendCommand {
  static config = {
    category: "GROUP",
    name: "resend",
    version: "1.0.2",
    author: "Lợi",
    description: {
      vi: "Gửi lại bức ảnh đã gỡ",
      en: "Resend the removed photo",
    },
    guide: {
      vi: "[prefix]resend on/off",
      en: "[prefix]resend on/off",
    },
    permission: 1,
  };

  static message = {
    vi: {
      error: "Đã xảy ra lỗi không xác định.",
      syntaxError: "Chỉ có thể dùng: on/off",
      info: "$0 vừa gỡ tin nhắn với nội dung: $1",
    },
    en: {
      error: "An unknown error has occurred.",
      syntaxError: "Can only be used: on/off",
      info: "$0 just removed a message with content: $1",
    },
  };
  constructor(private client) {}
  async event({ api, event, getLang, ThreadData }: IPangolinListenEvent) {
    async function handleMessageUnSend(message) {
      const user = await api.getUserInfo(event.senderID, (err, ret) => {});
      if (!message.attachments.length) {
        api.sendMessage(
          {
            body: getLang("info", user[event.senderID].name, message.body),
          },
          event.threadID,
        );
      }
      const attachments = message.attachments;
      let listAttachmentUnsend = [];
      let task = 0;
      function onFinish() {
        if (++task == attachments.length) {
          api.sendMessage(
            {
              body: getLang("info", user[event.senderID].name, message.body),
              attachment: listAttachmentUnsend,
            },
            event.threadID,
          );
        }
      }
      attachments.forEach(async (attachment, index) => {
        let nameAtt = "resend";
        const path = join(
          process.cwd(),
          `/public/images/${nameAtt}_${index}.jpg`,
        );
        await axios
          .get(attachment.url, { responseType: "arraybuffer" })
          .then((response) => {
            const buffer = Buffer.from(response.data);
            fs.writeFileSync(path, buffer);
            listAttachmentUnsend.push(fs.createReadStream(path));
          });
        onFinish();
      });
    }
    function getOldMessage() {
      const cachedArray = cache.get("old-message");
      if (cachedArray) {
        return cachedArray;
      } else {
        return [];
      }
    }
    if (event.type == "message") {
      const isResendOn = await ThreadData.resend.get(event.threadID);
      if (!isResendOn) return;
      if (event && event.messageID) {
        const ArrOldMessage = getOldMessage();
        if (ArrOldMessage) {
          if (
            !ArrOldMessage.some((item) => item.messageID == event.messageID)
          ) {
            ArrOldMessage.push(event);
            cache.put("old-message", ArrOldMessage, 60 * 1000 * 5);
          }
        }
      }
    }

    // handle logic event
    if (event.type == "message_unsend") {
      if (cache.get("old-message")) {
        cache.get("old-message").forEach((item) => {
          if (item.messageID == event.messageID) {
            handleMessageUnSend(item);
          }
        });
      }
    }
  }
  async run({ api, event, args, ThreadData, getLang }: IPangolinRun) {
    // handle switch resend
    if (args[1] == "on") {
      ThreadData.resend.set(event.threadID, true);
      api.sendMessage("Resend on!", event.threadID);
    } else if (args[1] == "off") {
      ThreadData.resend.set(event.threadID, false);
      api.sendMessage("Resend is disabled!!", event.threadID);
    } else {
      return api.sendMessage(getLang("syntaxError"), event.threadID);
    }
  }
}
