// import * as cache from "memory-cache";
import {
  IPangolinHandleEvent,
  IPangolinHandleReply,
  IPangolinRun,
} from "src/types/type.pangolin-handle";
export default class Test {
  static config = {
    name: "test",
  };

  constructor(private client) {}
  async handleReply({ api, event, reply }: IPangolinHandleReply) {
    console.log(reply.name, reply.messageID, reply.author, reply.value);
  }
  async handleReaction({ api, event }) {
    api.sendMessage("reply", "100049732817959");
  }

  async run({ api, event, UserData, cache }: IPangolinRun) {
    // clg
    api.sendMessage("test", event.threadID, (err, info) => {
      cache.client.handleReply({
        name: Test.config.name, //test là tên class
        messageID: info.messageID,
        author: event.senderID,
        value: event.body,
      });
    });
  }
  // async handleEvent({ api, event }: IPangolinHandleEvent) {
  //   if (event.type === "message_reply") {
  //     // đoạn này check nếu reply tin nhắn nào có id = với id lưu trong biến test ở cache
  //     const idReply = await cache.get("test");
  //     if (event.messageReply.messageID == idReply) {
  //       api.sendMessage("response reply", event.threadID);
  //     }
  //   }
  // }
}
