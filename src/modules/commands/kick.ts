import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class SetNameCommand {
  static config = {
    name: "kick",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description:
      "Cách dùng: [prefix]kick @mentions\nChức năng: Kick những người được tag",
    permission: 1,
  };

  constructor(private client) {}
  async run({ api, event, client, args }: IPangolinRun) {
    try {
      const info: any = await new Promise((resolve, reject) => {
        api.getThreadInfo(event.threadID, (err, info) => {
          if (err) return reject(err);
          else resolve(info);
        });
      });
      const { adminIDs } = info;
      if (
        !adminIDs
          .map((item) => {
            return item.id;
          })
          .includes(process.env.UID_BOT)
      ) {
        return api.sendMessage(
          "Bạn cần set cho bot làm admin để sử dụng lệnh này",
          event.threadID,
        );
      }
    } catch (err) {
      console.log(err);
    }
    if (!args[1] || !event.mentions)
      return api.sendMessage("Vui lòng tag một người!", event.threadID);
    const mentions = Object.keys(event.mentions);

    try {
      await mentions.forEach((mention) => {
        api.removeUserFromGroup(mention, event.threadID);
      });
    } catch (error) {
      console.log(error);
    }
    api.sendMessage(
      {
        body:
          "Đã kick " +
          Object.values(event.mentions).join(", ") +
          " ra khỏi nhóm!",
        mentions: Object.entries(event.mentions).map((mention) => {
          return {
            tag: mention[1],
            id: mention[0],
          };
        }),
      },
      event.threadID,
    );
  }
}
