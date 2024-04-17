import axios from "axios";
import * as cache from "memory-cache";
import * as fs from "fs";
import { join } from "path";
import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";

export default class ResendCommand {
  static config = {
    name: "resend",
    version: "1.0.1",
    author: "Lợi",
    createdAt: "",
    description:
      "Cách dùng: [prefix]on/off resend mode\nChức năng: on/off resend mode\nQuyền: admin group",
    permission: 1,
  };

  constructor(private client) {}
  async event({ api, event, client }) {
    const preCommand = await cache.get("command-event-on");
    if (!preCommand) return;
    if (
      !preCommand.some(
        (item) => item.threadID == event.threadID && item.command == "resend"
      )
    )
      return;
    function getOldMessage() {
      const cachedArray = cache.get("old-message");
      if (cachedArray) {
        return cachedArray;
      } else {
        return [];
      }
    }
    if (event && event.messageID) {
      const ArrOldMessage = getOldMessage();
      if (ArrOldMessage) {
        if (!ArrOldMessage.some((item) => item.messageID == event.messageID)) {
          ArrOldMessage.push(event);
          cache.put("old-message", ArrOldMessage, 6 * 10000 * 5);
        }
      }
    }
    async function handleMessageUnSend(message) {
      const user = await api.getUserInfo(event.senderID, (err, ret) => {});
      if (!message.attachments) {
        return api.sendMessage(
          {
            body: `${user[event.senderID].name} vừa gỡ tin nhắn với nội dung: ${message.body}`,
          },
          event.threadID
        );
      }
      const attachments = message.attachments;
      let i = 1;
      let listAttachmentUnsend = [];
      attachments.forEach(async (attachment) => {
        let nameAtt = "resend";
        const path = join(process.cwd(), `/public/images/${nameAtt}_${i}.jpg`);
        await axios
          .get(attachment.url, { responseType: "arraybuffer" })
          .then((response) => {
            const buffer = Buffer.from(response.data);
            fs.writeFileSync(path, buffer);
            listAttachmentUnsend.push(fs.createReadStream(path));
          })
          .then(() => {
            api.sendMessage(
              {
                body: `${user[event.senderID].name} vừa gỡ tin nhắn với nội dung: ${message.body}`,
                attachment: listAttachmentUnsend,
              },
              event.threadID
            );
          })
          .catch((error) => {
            console.error("Error downloading image:", error);
          });
      });
    }

    // handle logic event
    if (event.type == "message_unsend") {
      cache.get("old-message").forEach((item) => {
        if (item.messageID == event.messageID) {
          handleMessageUnSend(item);
        }
      });
    }
  }
  async run(api, event, client, args) {
    function getPrevCommandEvent() {
      const cachedArray = cache.get("command-event-on");
      if (cachedArray) {
        return cachedArray;
      } else {
        console.log("Array not found in cache. Fetching from the source.");
        return [];
      }
    }

    // handle switch resend
    let prevCommandEventOn = getPrevCommandEvent();
    if (args[1] == "on") {
      if (prevCommandEventOn) {
        if (
          prevCommandEventOn.some(
            (item) =>
              item.threadID == event.threadID && item.command == "resend"
          )
        ) {
          api.sendMessage("resend vẫn đang hoạt động", event.threadID);
          return;
        }
      }
      prevCommandEventOn.push({
        command: "resend",
        threadID: event.threadID,
      });
      cache.put("command-event-on", prevCommandEventOn, 6 * 10000 * 5); // Time in ms
      api.sendMessage("Resend on!", event.threadID);
    } else if (args[1] == "off") {
      const newPrevCommandEventOn = prevCommandEventOn.filter(
        (item) => item.threadID != event.threadID
      );
      cache.put("command-event-on", newPrevCommandEventOn, 6 * 10000 * 5); // Time in ms
      api.sendMessage("Resend is disabled!!", event.threadID);
    } else {
      return api.sendMessage("Chỉ có thể dùng: on/off", event.threadID);
    }
  }
}
