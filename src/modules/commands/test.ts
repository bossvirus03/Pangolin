import {
  IPangolinHandleReaction,
  IPangolinHandleReply,
  IPangolinRun,
} from "src/types/type.pangolin-handle";
export default class Test {
  static config = {
    name: "test",
  };

  constructor(private client) {}
  async handleReply({ api, event, messageReply }: IPangolinHandleReply) {
    console.log(event);
    console.log(
      messageReply.name, //
      messageReply.messageID, //
      messageReply.author, //
      messageReply.value, //nhận được exampleValueMessage ở đây
    );
  }
  async handleReaction({
    api,
    event,
    messageReaction,
  }: IPangolinHandleReaction) {
    console.log(event);
    console.log(
      messageReaction.name,
      messageReaction.messageID,
      messageReaction.author,
      messageReaction.value, //nhận được  event.body ở đây
    );
  }

  async run({ api, event, UserData }: IPangolinRun) {
    const exampleValueMessage = "nguyen van a";
    api.sendMessage("test reply", event.threadID, (err, info) => {
      global.client.messageReply.push({
        name: Test.config.name, //Test là tên class
        messageID: info.messageID,
        author: event.senderID,
        value: exampleValueMessage, //value có thể truyền vào bất cứ thứ gì (arr, object, ...)
      });
    });

    api.sendMessage("test reaction", event.threadID, (err, info) => {
      global.client.messageReaction.push({
        name: Test.config.name, //Test là tên class
        messageID: info.messageID,
        author: event.senderID,
        value: event.body, //value có thể truyền vào bất cứ thứ gì (arr, object, ...)
      });
    });
  }
}
