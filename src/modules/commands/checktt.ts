import * as cache from "memory-cache";

import {
  IPangolinListenEvent,
  IPangolinRun,
} from "src/types/type.pangolin-handle";
import { IUserInThreadData } from "src/types/type.userInThreadData";

export default class CheckttCommand {
  static config = {
    category: "GROUP",
    name: "checktt",
    version: "1.0.0",
    author: "Nguyên Blue | Lợi",
    permission: 0,
    description: {
      vi: "Kiểm tra số lượt thành viên tương tác của bạn trong nhóm",
      en: "Check the number of your interactions in the group",
    },
    guide: {
      vi: "[prefix]checktt",
      en: "[prefix]checktt",
    },
  };

  static message = {
    vi: {
      listInteract: "$0",
      notGroup: "Đây không phải 1 nhóm!",
    },
    en: {
      listInteract: "$0",
      notGroup: "This is not a group!",
    },
  };

  constructor(private client) {}

  async event({
    api,
    event,
    client,
    UserData,
    ThreadData,
    UserInThreadData,
  }: IPangolinListenEvent) {
    if (event.type === "message_reaction") {
      const messageID = cache.get("message-id");
      if (messageID && event.reaction === "❤") {
        api.getThreadInfo(event.threadID, async (err, res) => {
          if (err) {
            console.error("Error:", err);
            return;
          }

          const users = res.participantIDs;
          const smg = await Promise.all(
            users.map(async (item) => {
              try {
                const user = await UserInThreadData.get(item, event.threadID);
                if (user) {
                  return { name: user.name, exp: user.exp };
                }
              } catch (error) {
                console.error("Error:", error);
              }
            }),
          );

          smg.sort((a, b) => b.exp - a.exp);
          let smgSorted = "";
          smg.forEach((user, index) => {
            if (user) {
              let medal = "";
              switch (index) {
                case 0:
                  medal = "🥇";
                  break;
                case 1:
                  medal = "🥈";
                  break;
                case 2:
                  medal = "🥉";
                  break;
                default:
                  medal = ` ${index + 1}.`;
                  break;
              }
              smgSorted += `${medal} ${user.name} - ${user.exp}\n`;
            }
          });

          api.sendMessage(
            "[ KIỂM TRA TIN NHẮN TỔNG ]" + "\n" + smgSorted,
            event.threadID,
          );
          cache.del("message-id");
        });
      }
    }
  }

  async run({
    api,
    event,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
  }: IPangolinRun) {
    try {
      if (!event.isGroup) {
        return api.sendMessage(
          getLang("notGroup"),
          event.threadID,
          () => {},
          event.messageID,
        );
      }
      const user = event.senderID;
      const res = await UserInThreadData.get(user, event.threadID);
      const threadInfo: any = await new Promise((resolve, reject) => {
        api.getThreadInfo(event.threadID, (err, info) => {
          if (err) reject(err);
          else resolve(info);
        });
      });
      const listad = threadInfo.adminIDs.map((admin) => admin.id);

      const threadName = threadInfo.threadName;
      const position = listad.includes(res.uid)
        ? "Quản trị viên"
        : "Thành viên";

      let getRankName = (count) => {
        return count > 4440
          ? "Bất Diệt Chi Cảnh"
          : count > 4040
            ? "Sáng Thế Cảnh Đỉnh Phong"
            : count > 3840
              ? "Sáng Thế Cảnh Hậu Kì"
              : count > 3640
                ? "Sáng Thế Cảnh Trung Kì"
                : count > 3440
                  ? "Sáng Thế Cảnh Sơ Kì"
                  : count > 3240
                    ? "Hợp Đạo Cảnh Đỉnh Phong"
                    : count > 3040
                      ? "Hợp Đạo Cảnh Hậu Kì"
                      : count > 2840
                        ? "Hợp Đạo Cảnh Trung Kì"
                        : count > 2640
                          ? "Hợp Đạo Cảnh Sơ Kì"
                          : count > 2440
                            ? "Thánh Vương Cảnh Đỉnh Phong"
                            : count > 2240
                              ? "Thánh Vương Cảnh Hậu Kì"
                              : count > 2220
                                ? "Thánh Vương Cảnh Trung Kì"
                                : count > 2200
                                  ? "Thánh Vương Cảnh Sơ Kì"
                                  : count > 2180
                                    ? "Thánh Cảnh Đỉnh Phong"
                                    : count > 2160
                                      ? "Thánh Cảnh Hậu Kì"
                                      : count > 2140
                                        ? "Thánh Cảnh Trung Kì"
                                        : count > 2120
                                          ? "Thánh Cảnh Sơ Kì"
                                          : count > 2100
                                            ? "Chí Tôn Đỉnh Phong"
                                            : count > 2080
                                              ? "Chí Tôn Hậu Kì"
                                              : count > 2060
                                                ? "Chí Tôn Trung Kì"
                                                : count > 2040
                                                  ? "Chí Tôn Sơ Kì"
                                                  : count > 2020
                                                    ? "Đại Thánh Đỉnh Phong"
                                                    : count > 2000
                                                      ? "Đại Thánh Hậu Kì"
                                                      : count > 1980
                                                        ? "Đại Thánh Trung Kì"
                                                        : count > 1960
                                                          ? "Đại Thánh Sơ Kì"
                                                          : count > 1940
                                                            ? "Tiểu Thánh Đỉnh Phong"
                                                            : count > 1920
                                                              ? "Tiểu Thánh Hậu Kì"
                                                              : count > 1900
                                                                ? "Tiểu Thánh Trung Kì"
                                                                : count > 1880
                                                                  ? "Tiểu Thánh Sơ Kì"
                                                                  : count > 1860
                                                                    ? "Đạo Tổ Đỉnh Phong"
                                                                    : count >
                                                                        1840
                                                                      ? "Đạo Tổ Hậu Kì"
                                                                      : count >
                                                                          1820
                                                                        ? "Đạo Tổ Trung Kì"
                                                                        : count >
                                                                            1800
                                                                          ? "Đạo Tổ Sơ Kì"
                                                                          : count >
                                                                              1780
                                                                            ? "Đạo Đế Đỉnh Phong"
                                                                            : count >
                                                                                1760
                                                                              ? "Đạo Đế Hậu Kì"
                                                                              : count >
                                                                                  1740
                                                                                ? "Đạo Đế Trung Kì"
                                                                                : count >
                                                                                    1720
                                                                                  ? "Đạo Đế Sơ Kì"
                                                                                  : count >
                                                                                      1700
                                                                                    ? "Đạo Tôn Đỉnh Phong"
                                                                                    : count >
                                                                                        1680
                                                                                      ? "Đạo Tôn Hậu Kì"
                                                                                      : count >
                                                                                          1660
                                                                                        ? "Đạo Tôn Trung Kì"
                                                                                        : count >
                                                                                            1640
                                                                                          ? "Đạo Tôn Sơ Kì"
                                                                                          : count >
                                                                                              1620
                                                                                            ? "Tiên Đế Đỉnh Phong"
                                                                                            : count >
                                                                                                1600
                                                                                              ? "Tiên Đế Hậu Kì"
                                                                                              : count >
                                                                                                  1580
                                                                                                ? "Tiên Đế Trung Kì"
                                                                                                : count >
                                                                                                    1560
                                                                                                  ? "Tiên Đế Sơ Kì"
                                                                                                  : count >
                                                                                                      1540
                                                                                                    ? "Tiên Tôn Đỉnh Phong"
                                                                                                    : count >
                                                                                                        1520
                                                                                                      ? "Tiên Tôn Hậu Kì"
                                                                                                      : count >
                                                                                                          1500
                                                                                                        ? "Tiên Tôn Trung Kì"
                                                                                                        : count >
                                                                                                            1480
                                                                                                          ? "Tiên Tôn Sơ Kì"
                                                                                                          : count >
                                                                                                              1460
                                                                                                            ? "Tiên Vương Đỉnh Phong"
                                                                                                            : count >
                                                                                                                1440
                                                                                                              ? "Tiên Vương Hậu Kì"
                                                                                                              : count >
                                                                                                                  1420
                                                                                                                ? "Tiên Vương Trung Kì"
                                                                                                                : count >
                                                                                                                    1400
                                                                                                                  ? "Tiên Vương Sơ Kì"
                                                                                                                  : count >
                                                                                                                      1380
                                                                                                                    ? "Đại La Kim Tiên"
                                                                                                                    : count >
                                                                                                                        1360
                                                                                                                      ? "Đại La Chân Tiên"
                                                                                                                      : count >
                                                                                                                          1340
                                                                                                                        ? "Đại La Tán Tiên"
                                                                                                                        : count >
                                                                                                                            1320
                                                                                                                          ? "Thái Ất Kim Tiên"
                                                                                                                          : count >
                                                                                                                              1300
                                                                                                                            ? "Thái Ất Chân Tiên"
                                                                                                                            : count >
                                                                                                                                1280
                                                                                                                              ? "Thái Ất Tán Tiên"
                                                                                                                              : count >
                                                                                                                                  1260
                                                                                                                                ? "Kim Tiên Đỉnh Phong"
                                                                                                                                : count >
                                                                                                                                    1240
                                                                                                                                  ? "Kim Tiên Hậu Kì"
                                                                                                                                  : count >
                                                                                                                                      1220
                                                                                                                                    ? "Kim Tiên Trung Kì"
                                                                                                                                    : count >
                                                                                                                                        1200
                                                                                                                                      ? "Kim Tiên Sơ Kì"
                                                                                                                                      : count >
                                                                                                                                          1180
                                                                                                                                        ? "Thiên Tiên Đỉnh Phong"
                                                                                                                                        : count >
                                                                                                                                            1160
                                                                                                                                          ? "Thiên Tiên Hậu Kì"
                                                                                                                                          : count >
                                                                                                                                              1140
                                                                                                                                            ? "Thiên Tiên Trung Kì"
                                                                                                                                            : count >
                                                                                                                                                1120
                                                                                                                                              ? "Thiên Tiên Sơ Kì"
                                                                                                                                              : count >
                                                                                                                                                  1100
                                                                                                                                                ? "Địa Tiên Đỉnh Phong"
                                                                                                                                                : count >
                                                                                                                                                    1080
                                                                                                                                                  ? "Địa Tiên Hậu Kì"
                                                                                                                                                  : count >
                                                                                                                                                      1060
                                                                                                                                                    ? "Địa Tiên Trung Kì"
                                                                                                                                                    : count >
                                                                                                                                                        1040
                                                                                                                                                      ? "Địa Tiên Sơ Kì"
                                                                                                                                                      : count >
                                                                                                                                                          1020
                                                                                                                                                        ? "Nhân Tiên Đỉnh Phong"
                                                                                                                                                        : count >
                                                                                                                                                            1000
                                                                                                                                                          ? "Nhân Tiên Hậu Kì"
                                                                                                                                                          : count >
                                                                                                                                                              980
                                                                                                                                                            ? "Nhân Tiên Trung Kì"
                                                                                                                                                            : count >
                                                                                                                                                                960
                                                                                                                                                              ? "Nhân Tiên Sơ Kì"
                                                                                                                                                              : count >
                                                                                                                                                                  940
                                                                                                                                                                ? "Bán Tiên Đỉnh Phong"
                                                                                                                                                                : count >
                                                                                                                                                                    920
                                                                                                                                                                  ? "Bán Tiên Hậu Kì"
                                                                                                                                                                  : count >
                                                                                                                                                                      900
                                                                                                                                                                    ? "Bán Tiên Trung Kì"
                                                                                                                                                                    : count >
                                                                                                                                                                        880
                                                                                                                                                                      ? "Bán Tiên Sơ Kì"
                                                                                                                                                                      : count >
                                                                                                                                                                          860
                                                                                                                                                                        ? "Đại Thừa Cảnh Đỉnh Phong"
                                                                                                                                                                        : count >
                                                                                                                                                                            840
                                                                                                                                                                          ? "Đại Thừa Cảnh Hậu Kì"
                                                                                                                                                                          : count >
                                                                                                                                                                              820
                                                                                                                                                                            ? "Đại Thừa Cảnh Trung Kì"
                                                                                                                                                                            : count >
                                                                                                                                                                                800
                                                                                                                                                                              ? "Đại Thùa Cảnh Sơ Kì"
                                                                                                                                                                              : count >
                                                                                                                                                                                  780
                                                                                                                                                                                ? "Độ Kiếp Cảnh Đỉnh Phong"
                                                                                                                                                                                : count >
                                                                                                                                                                                    760
                                                                                                                                                                                  ? "Độ Kiếp Cảnh Hậu Kì"
                                                                                                                                                                                  : count >
                                                                                                                                                                                      740
                                                                                                                                                                                    ? "Độ Kiếp Cảnh Trung Kì"
                                                                                                                                                                                    : count >
                                                                                                                                                                                        720
                                                                                                                                                                                      ? "Độ Kiếp Cảnh Sơ Kì"
                                                                                                                                                                                      : count >
                                                                                                                                                                                          700
                                                                                                                                                                                        ? "Hợp Thể Cảnh Đỉnh Phong"
                                                                                                                                                                                        : count >
                                                                                                                                                                                            680
                                                                                                                                                                                          ? "Hợp Thể Cảnh Hậu Kì"
                                                                                                                                                                                          : count >
                                                                                                                                                                                              660
                                                                                                                                                                                            ? "Hợp Thể Cảnh Trung Kì"
                                                                                                                                                                                            : count >
                                                                                                                                                                                                640
                                                                                                                                                                                              ? "Hợp Thể Cảnh Sơ Kì"
                                                                                                                                                                                              : count >
                                                                                                                                                                                                  620
                                                                                                                                                                                                ? "Luyện Hư Cảnh Đỉnh Phong"
                                                                                                                                                                                                : count >
                                                                                                                                                                                                    600
                                                                                                                                                                                                  ? "Luyện Hư Cảnh Hậu Kì"
                                                                                                                                                                                                  : count >
                                                                                                                                                                                                      580
                                                                                                                                                                                                    ? "Luyện Hư Cảnh Trung Kì"
                                                                                                                                                                                                    : count >
                                                                                                                                                                                                        560
                                                                                                                                                                                                      ? "Luyện Hư Cảnh Sơ Kì"
                                                                                                                                                                                                      : count >
                                                                                                                                                                                                          540
                                                                                                                                                                                                        ? "Hoá Thần Đỉnh Phong"
                                                                                                                                                                                                        : count >
                                                                                                                                                                                                            520
                                                                                                                                                                                                          ? "Hoá Thần Hậu Kì"
                                                                                                                                                                                                          : count >
                                                                                                                                                                                                              500
                                                                                                                                                                                                            ? "Hoá Thần Trung Kì"
                                                                                                                                                                                                            : count >
                                                                                                                                                                                                                480
                                                                                                                                                                                                              ? "Hoá Thần Sơ Kì"
                                                                                                                                                                                                              : count >
                                                                                                                                                                                                                  460
                                                                                                                                                                                                                ? "Nguyên Anh Đỉnh Phong"
                                                                                                                                                                                                                : count >
                                                                                                                                                                                                                    440
                                                                                                                                                                                                                  ? "Nguyên Anh Hậu Kì"
                                                                                                                                                                                                                  : count >
                                                                                                                                                                                                                      420
                                                                                                                                                                                                                    ? "Nguyên Anh Trung Kì"
                                                                                                                                                                                                                    : count >
                                                                                                                                                                                                                        400
                                                                                                                                                                                                                      ? "Nguyên Anh Sơ Kì"
                                                                                                                                                                                                                      : count >
                                                                                                                                                                                                                          380
                                                                                                                                                                                                                        ? "Kim Đan Đỉnh Phong"
                                                                                                                                                                                                                        : count >
                                                                                                                                                                                                                            360
                                                                                                                                                                                                                          ? "Kim Đan Hậu Kì"
                                                                                                                                                                                                                          : count >
                                                                                                                                                                                                                              340
                                                                                                                                                                                                                            ? "Kim Đan Trung Kì"
                                                                                                                                                                                                                            : count >
                                                                                                                                                                                                                                320
                                                                                                                                                                                                                              ? "Kim Đan Sơ Kì"
                                                                                                                                                                                                                              : count >
                                                                                                                                                                                                                                  300
                                                                                                                                                                                                                                ? "Trúc Cơ Đỉnh Phong"
                                                                                                                                                                                                                                : count >
                                                                                                                                                                                                                                    280
                                                                                                                                                                                                                                  ? "Trúc Cơ Hậu Kì"
                                                                                                                                                                                                                                  : count >
                                                                                                                                                                                                                                      260
                                                                                                                                                                                                                                    ? "Trúc Cơ Trung Kì"
                                                                                                                                                                                                                                    : count >
                                                                                                                                                                                                                                        240
                                                                                                                                                                                                                                      ? "Trúc Cơ Sơ Kì"
                                                                                                                                                                                                                                      : count >
                                                                                                                                                                                                                                          220
                                                                                                                                                                                                                                        ? "Luyện Khí Đỉnh Phong"
                                                                                                                                                                                                                                        : count >
                                                                                                                                                                                                                                            200
                                                                                                                                                                                                                                          ? "Luyện Khí Tầng Viên Mãn"
                                                                                                                                                                                                                                          : count >
                                                                                                                                                                                                                                              180
                                                                                                                                                                                                                                            ? "Luyện Khí Tầng 10"
                                                                                                                                                                                                                                            : count >
                                                                                                                                                                                                                                                160
                                                                                                                                                                                                                                              ? "Luyện Khí Tầng 9"
                                                                                                                                                                                                                                              : count >
                                                                                                                                                                                                                                                  140
                                                                                                                                                                                                                                                ? "Luyện Khí Tầng 8"
                                                                                                                                                                                                                                                : count >
                                                                                                                                                                                                                                                    120
                                                                                                                                                                                                                                                  ? "Luyện Khí Tầng 7"
                                                                                                                                                                                                                                                  : count >
                                                                                                                                                                                                                                                      100
                                                                                                                                                                                                                                                    ? "Luyện Khí Tầng 5"
                                                                                                                                                                                                                                                    : count >
                                                                                                                                                                                                                                                        80
                                                                                                                                                                                                                                                      ? "Luyện Khí Tầng 4"
                                                                                                                                                                                                                                                      : count >
                                                                                                                                                                                                                                                          60
                                                                                                                                                                                                                                                        ? "Luyện Khí Tầng 3"
                                                                                                                                                                                                                                                        : count >
                                                                                                                                                                                                                                                            40
                                                                                                                                                                                                                                                          ? "Luyện Khí Tầng 2"
                                                                                                                                                                                                                                                          : count >
                                                                                                                                                                                                                                                              20
                                                                                                                                                                                                                                                            ? "Luyện Khí Tầng 1"
                                                                                                                                                                                                                                                            : "𝐍𝐡𝐚̣̂𝐩 𝐌𝐨̂𝐧";
      };

      let smgSorted = "";
      if (res) {
        smgSorted += `♻️ Nhóm: ${threadName}\n👤 Tên: ${res.name}\n🎖️ Chức Vụ: ${position}\n💬Tin nhắn trong ngày: ${res.countMessageOfDay}\n💬Tin nhắn trong tuần: ${res.countMessageOfWeek}\n💬 Tổng Tin Nhắn: ${res.exp}\n📊 Tu Vi Hiện Tại: ${getRankName(res.exp)}\n\n📌 Thả cảm xúc '❤️' tin nhắn này để xem tổng tin nhắn của toàn bộ thành viên trong nhóm`;
      } else {
        smgSorted += "Không có dữ liệu về tương tác của bạn trong nhóm này.";
      }

      api.sendMessage(
        getLang("listInteract", smgSorted),
        event.threadID,
        (err, res) => {
          if (err) {
            console.error("Error:", err);
            return;
          }
          cache.put(
            "message-id",
            {
              messageID: res.messageID,
            },
            5 * 1000 * 60, //5 minutes
          );
        },
        event.messageID,
      );
    } catch (error) {
      console.error("Error:", error);
    }
  }
}
