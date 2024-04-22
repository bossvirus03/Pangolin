import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class SetNameCommand {
  static config = {
    category: "GROUP",
    name: "kick",
    version: "1.0.0",
    author: "Lợi",
    description: {
      vi: "Kick những người được tag",
      en: "Kick those tagged",
    },
    permission: 1,
    guide: {
      vi: "[prefix]kick @mentions",
      en: "[prefix]kick @mentions",
    },
  };

  static message = {
    vi: {
      notGroup: "Chỉ sử dụng trong nhóm chat",
      needAdmin: "Bạn cần set cho bot làm admin để sử dụng lệnh này",
      syntaxError: "Vui lòng tag một người!",
      kicked: "Đã kick $0 ra khỏi nhóm!",
    },
    en: {
      notGroup: "only use it in groups",
      syntaxError: "Please tag someone!",
      needAdmin: "You need to set the bot as admin to use this command",
      kicked: "Kicked $0 out of the group!",
    },
  };
  constructor(private client) {}
  async run({ api, event, getLang, args }: IPangolinRun) {
    if (!event.isGroup) {
      return api.sendMessage(getLang("notGroup"), event.threadID);
    }
    const UID_BOT = api.getCurrentUserID();
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
          .includes(UID_BOT)
      ) {
        return api.sendMessage(getLang("needAdmin"), event.threadID);
      }
    } catch (err) {
      console.log(err);
    }
    if (!args[1] || !event.mentions)
      return api.sendMessage(getLang("syntaxError"), event.threadID);
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
        body: getLang("kicked", Object.values(event.mentions).join(", ")),
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
