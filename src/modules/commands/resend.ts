import axios from "axios";
import * as cache from "memory-cache";

export default class ResendCommand {
  static config = {
    name: "resend",
    version: "1.0.0",
    author: "loi",
    createdAt: "13/3/24",
    description: "on/off resend mode",
  };

  constructor(private client) {}
  async event(api, event, client) {
    // console.log(event);
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
      api.getUserInfo([event.senderID], (err, ret) => {
        if (err) return console.error(err);
        for (var prop in ret) {
          if (ret[prop].name) {
            api.sendMessage(
              `${ret[prop].name} vừa gỡ tin nhắn với nội dung: ${message.body}`,
              event.threadID
            );
          }
        }
      });
    }

    // handle logic event
    if (event.type == "message_unsend") {
      const preCommand = await cache.get("command-event-on");
      if (preCommand.some((command) => command.threadID == event.threadID))
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

    // handle switch AI
    let prevCommandEventOn = getPrevCommandEvent();
    if (args[1] == "on") {
      if (prevCommandEventOn) {
        if (
          prevCommandEventOn.some((item) => item.threadID == event.threadID)
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
      api.sendMessage("Resend on!", event.threadID, event.messageID);
    }
    if (args[1] == "off") {
      const newPrevCommandEventOn = prevCommandEventOn.filter(
        (item) => item.threadID == event.threadID
      );
      cache.put("command-event-on", newPrevCommandEventOn, 6 * 10000 * 5); // Time in ms
      api.sendMessage("Resend is disabled!!", event.threadID, event.messageID);
    }
  }
}
