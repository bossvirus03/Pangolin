import { IPangolinRun } from "src/types/type.pangolin-handle";
import { findUid } from "./../../util/function";

export default class AddUserName {
  static config = {
    name: "addUser", //your command name
    version: "1.0.0",
    author: "Lợi",
    description: {
      vi: "",
      en: "",
    },
    guide: {
      vi: "",
      en: "",
    },
  };

  static message = {
    vi: {
      text1: "",
      text2: "",
    },
    en: {
      text1: "",
      text2: "",
    },
  };

  constructor(private client) {}
  async run({ api, event, args, UserInThreadData }: IPangolinRun) {
    const regexFb =
      /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i;

    for (const item of args) {
      if (regexFb.test(item)) {
        const uid = await getUid(item);
        if (uid) {
          const user = await UserInThreadData.get(uid, event.threadID);
          if (user) api.sendMessage("User đã tồn tại", event.threadID);
          else {
            const newUser = new Promise((resolve, reject) => {
              api.getUserInfo(uid, (err, info) => {
                if (err) reject(err);
                else {
                  resolve(info[uid]);
                }
              });
            });

            newUser
              .then((user: any) => {
                return api
                  .addUserToGroup(uid, event.threadID)
                  .then(() => {
                    api.sendMessage(
                      `Đã thêm ${user.name} vào nhóm`,
                      event.threadID,
                    );
                  })
                  .catch(() => {
                    api.sendMessage(
                      "Không thể thêm User vào nhóm!",
                      event.threadID,
                      () => {},
                      event.messageID,
                    );
                  });
              })
              .catch((err) => {
                console.error("Error fetching user info:", err);
              });
          }
        }
      }
      async function getUid(link) {
        try {
          const uid = await findUid(link);
          return uid;
        } catch (error) {
          api.sendMessage(
            "Link facebook không hợp lệ",
            event.threadID,
            () => {},
            event.messageID,
          );
        }
      }
    }
  }
}
