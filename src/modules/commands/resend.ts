import * as cache from "memory-cache";

export default class ResendCommand {
  static config = {
    name: "resend",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "13/3/24",
    description:
      "Cách dùng: [prefix]on/off resend mode\nChức năng: on/off resend mode\nQuyền: admin group",
    permission: 1,
  };

  constructor(private client) {}
  async event(api, event, client) {
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
      const isCommandOn = cache.get("command-event-on");
      await api.getUserInfo([event.senderID], (err, ret) => {
        if (err) return console.error(err);
        for (var prop in ret) {
          if (ret[prop].name) {
            api.sendMessage(
              {
                body: `${ret[prop].name} vừa gỡ tin nhắn với nội dung: ${message.body}`,
                // attachment: message.attachments.url,
              },
              event.threadID
            );
          }
        }
      });
    }

    // handle logic event
    if (event.type == "message_unsend") {
      const preCommand = await cache.get("command-event-on");
      if (
        preCommand.some(
          (item) => item.threadID == event.threadID && item.command == "resend"
        )
      )
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
      api.sendMessage("Resend on!", event.threadID, event.messageID);
    }
    if (args[1] == "off") {
      const newPrevCommandEventOn = prevCommandEventOn.filter(
        (item) => item.threadID != event.threadID
      );
      console.log("newPrevCommandEventOn", newPrevCommandEventOn);
      cache.put("command-event-on", newPrevCommandEventOn, 6 * 10000 * 5); // Time in ms
      api.sendMessage("Resend is disabled!!", event.threadID, event.messageID);
    }
  }
}
