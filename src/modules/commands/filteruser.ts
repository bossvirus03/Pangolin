import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class FbuserCommand {
  static config = {
    name: "filteruser",
    version: "1.0.0",
    author: "Nguyên Blue",
    category: "TOOL",
    description: {
      vi: "lọc user bị mất tài khoản ra khỏi nhóm",
      en: "Filter users who have lost their accounts out of the group",
    },
    guide: {
      vi: "[prefix]filteruser",
      en: "[prefix]filteruser",
    },
  };

  static message = {
    vi: {
      info: "Đã lọc thành công",
      donthave: "Trong nhóm của bạn không có 'Người dùng Facebook'.",
      count: "Nhóm bạn hiện có $0 'Người dùng Facebook'.",
      isNotAdmin: "Bot không phải quản trị viên nên không thể lọc..",
      start: "Đang bắt đầu lọc..",
      filterSuccess: "Đã lọc thành công $0 người.",
      filterFail: "Không thể lọc $0 người",
      error: "Đã xảy ra lỗi khi thực hiện yêu cầu.",
    },
    en: {
      donthave: "In your group 'Facebook User' does not exist.",
      info: "Filtered successfully",
      count: "Your group currently has $0 'Facebook users'.",
      isNotAdmin: "Bot is not an administrator so cannot filter..",
      start: "Starting filtering..",
      filterSuccess: "Successfully filtered $0 people.",
      filterFail: "Unable to filter $0 people",
      error: "An error occurred while making the request.",
    },
  };
  constructor(private client) {}
  async run({ api, event, getLang }: IPangolinRun) {
    try {
      const threadInfo: any = await new Promise((resolve, reject) => {
        api.getThreadInfo(event.threadID, (err, info) => {
          if (err) reject(err);
          else resolve(info);
        });
      });
      const { userInfo, adminIDs } = threadInfo;

      let success = 0,
        fail = 0;
      let arr = [];

      for (const user of userInfo) {
        if (user.gender === undefined) {
          arr.push(user.id);
        }
      }

      const isBotAdmin = adminIDs.some(
        (admin) => admin.id === api.getCurrentUserID(),
      );

      if (arr.length === 0) {
        return api.sendMessage(getLang("donthave"), event.threadID);
      } else {
        api.sendMessage(
          getLang("count", arr.length),
          event.threadID,
          async () => {
            if (!isBotAdmin) {
              api.sendMessage(getLang("isNotAdmin"), event.threadID);
            } else {
              api.sendMessage(getLang("start"), event.threadID, async () => {
                for (const userId of arr) {
                  try {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    await api.removeUserFromGroup(userId, event.threadID);
                    success++;
                  } catch {
                    fail++;
                  }
                }

                api.sendMessage(
                  getLang("filterSuccess", success),
                  event.threadID,
                  () => {
                    if (fail !== 0) {
                      api.sendMessage(
                        getLang("filterFail", fail),
                        event.threadID,
                      );
                    }
                  },
                );
              });
            }
          },
        );
      }
    } catch (error) {
      api.sendMessage(getLang("error"), event.threadID);
    }
  }
}
