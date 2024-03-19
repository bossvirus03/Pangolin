import * as emoji from "node-emoji";
import { join } from "path";
import * as fs from "fs";

export default class autoReaction {
  static config = {
    name: "autoReaction",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
    description: "1",
  };

  constructor(private client) {}

  pathAutoReaction = join(
    process.cwd(),
    "/src/database/data/autoReaction.json"
  );

  async event(api, event, client, args) {
    if (event.type == "message") {
      const dataAutoReaction = fs.readFileSync(this.pathAutoReaction, {
        encoding: "utf-8",
      });
      if (dataAutoReaction) {
        const dataAutoReactionArray = JSON.parse(dataAutoReaction);
        dataAutoReactionArray.forEach((item) => {
          // console.log(item.userID, event.senderID);
          if (
            item.threadID == event.threadID &&
            item.userID == event.senderID
          ) {
            api.setMessageReaction(item.emoji, event.messageID, (err) => {
              if (err) return console.log(err);
            });
          }
        });
      }
    }
  }
  async run(api, event, client, args) {
    if (!args[1] || !event.mentions)
      return api.sendMessage("Vui lòng tag một người!", event.threadID);
    const e = event.body.split(Object.values(event.mentions)[0])[1].trim();
    if (!e) return api.sendMessage("Vui lòng chọn emoji!", event.threadID);
    const mention = Object.keys(event.mentions)[0];
    const listEmojiSupport = ["😍", "😆", "😮", "😢", "😠", "👍", "👎"];
    // if turn off auto-reaction
    if (e == "off") {
      const dataAutoReaction = fs.readFileSync(this.pathAutoReaction, {
        encoding: "utf-8",
      });
      if (dataAutoReaction) {
        const dataAutoReactionArray = JSON.parse(dataAutoReaction);

        const newdataAutoReactionArray = dataAutoReactionArray.filter(
          (item) => {
            return item.threadID == event.threadID && item.userID != mention;
          }
        );
        fs.writeFileSync(
          this.pathAutoReaction,
          JSON.stringify(newdataAutoReactionArray),
          {
            encoding: "utf-8",
          }
        );
      }
      return api.sendMessage(
        {
          body: `Đã tắt auto-reaction người dùng ${Object.values(event.mentions)[0]}`,
          mentions: [
            {
              tag: Object.values(event.mentions)[0],
              id: mention,
              fromIndex: 10,
            },
          ],
        },
        event.threadID
      );
    }

    // if emoji is not exits
    if (!emoji.has(e))
      return api.sendMessage("Không Tồn tại emoji " + e, event.threadID);

    if (!listEmojiSupport.includes(e))
      return api.sendMessage(
        "Chỉ hỗ trợ các emoji: " + listEmojiSupport.join(", "),
        event.threadID
      );
    let autoReactionUser = [
      {
        threadID: event.threadID,
        userID: mention,
        emoji: e,
      },
    ];
    const previousAutoReactionUser = fs.readFileSync(this.pathAutoReaction, {
      encoding: "utf-8",
    });
    if (previousAutoReactionUser) {
      const previousAutoReactionUserArray = JSON.parse(
        previousAutoReactionUser
      );

      // if duplicate data
      const isDuplicate = previousAutoReactionUserArray.some((item) => {
        return (
          item.threadID == autoReactionUser[0].threadID &&
          item.userID == autoReactionUser[0].userID &&
          item.emoji == autoReactionUser[0].emoji
        );
      });

      if (!isDuplicate) {
        autoReactionUser = autoReactionUser.concat(
          previousAutoReactionUserArray
        );
        fs.writeFileSync(
          this.pathAutoReaction,
          JSON.stringify(autoReactionUser),
          {
            encoding: "utf-8",
          }
        );
      }
      // if change emoji
      const isChangeEmoji = previousAutoReactionUserArray.some((item) => {
        return (
          item.threadID == autoReactionUser[0].threadID &&
          item.userID == autoReactionUser[0].userID &&
          item.emoji != autoReactionUser[0].emoji
        );
      });
      if (isChangeEmoji) {
        const newAutoReactionUserArray = previousAutoReactionUserArray.map(
          (item) => {
            if (
              item.threadID == autoReactionUser[0].threadID &&
              item.userID == autoReactionUser[0].userID &&
              item.emoji != autoReactionUser[0].emoji
            ) {
              item.emoji = e;
            }
            return item;
          }
        );
        fs.writeFileSync(
          this.pathAutoReaction,
          JSON.stringify(newAutoReactionUserArray),
          {
            encoding: "utf-8",
          }
        );
      }
    }
    api.sendMessage(
      {
        body: `Từ giờ cứ khi ${Object.values(event.mentions)[0]} nhắn thì bot sẽ reaction ${e}`,
        mentions: [
          {
            tag: Object.values(event.mentions)[0],
            id: mention,
            fromIndex: 10,
          },
        ],
      },
      event.threadID
    );
  }
}
