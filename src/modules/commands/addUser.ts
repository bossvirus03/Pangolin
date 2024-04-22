import { IPangolinRun } from "src/types/type.pangolin-handle";
import { findUid } from "./../../util/function";

export default class AddUserName {
  static config = {
    name: "addUser", //your command name
    version: "1.0.0",
    author: "Lợi",
    category: "GROUP",
    description: {
      vi: "Thêm thành viên mới vào nhóm",
      en: "Add new members to the group",
    },
    guide: {
      vi: "[prefix]addUser [danh sách link facebook]",
      en: "[prefix]addUser [list link facebook]",
    },
  };

  static message = {
    vi: {
      userAlreadyExists: "User đã tồn tại",
      addedUser: "Đã thêm $0 vào nhóm",
      canNotAddUser: "Không thể thêm User vào nhóm!",
      linkInvalid: "Link facebook không hợp lệ!",
    },
    en: {
      userAlreadyExists: "User already exists",
      addedUser: "Added $0 to the group",
      canNotAddUser: "Can not add user to group!",
      linkInvalid: "Link facebook is invalid!",
    },
  };

  constructor(private client) {}
  async run({ api, event, args, UserInThreadData, getLang }: IPangolinRun) {
    const regexFb =
      /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i;

    for (const item of args) {
      if (regexFb.test(item)) {
        const uid = await getUid(item);
        if (uid) {
          const user = await UserInThreadData.get(uid, event.threadID);
          if (user)
            api.sendMessage(getLang("userAlreadyExists"), event.threadID);
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
                      getLang("addedUser", user.name),
                      event.threadID,
                    );
                  })
                  .catch(() => {
                    api.sendMessage(
                      getLang("canNotAddUser", user.name),
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
            getLang("linkInvalid"),
            event.threadID,
            () => {},
            event.messageID,
          );
        }
      }
    }
  }
}
