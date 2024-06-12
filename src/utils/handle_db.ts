import sequelize from "./../db/database";
import { Thread } from "./../db/models/threadModel";
import { UserInThread } from "./../db/models/userInThreadModel";
import { User } from "./../db/models/userModel";
import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import moment from "moment";
import { join } from "path";
import * as fs from "fs";

const configPath = join(process.cwd(), "pangolin.config.json");
const dataConfig = fs.readFileSync(configPath, "utf8");
const config = JSON.parse(dataConfig);
export async function createUserIfNotExists(api: Ifca, event: IEvent) {
  if (event.type == "message") {
    try {
      // Kiểm tra xem kết nối đã được thiết lập chưa
      if (!sequelize.isDefined("User")) {
        await sequelize.authenticate();
        // Định nghĩa các model
        sequelize.addModels([User]);
        sequelize.sync();
      }

      // Tìm người dùng theo uid (senderID)
      const user = await User.findOne({ where: { uid: event.senderID } });
      if (!user) {
        // Thêm user vào cơ sở dữ liệu nếu không tồn tại
        const nameUser = await api.getUserInfo(
          event.senderID,
          (err, ret) => {},
        );
        const newUser = await User.create({
          uid: event.senderID,
          name: `${nameUser[event.senderID].name}`,
          exp: 0,
          money: 0,
          prefix: null,
        });
        console.log(
          global.getLang("UserCreated", `${newUser.name} | ${newUser.uid}`),
        );
      } else {
        await User.update(
          { exp: user.exp + 1 },
          { where: { uid: event.senderID } },
        );
      }
    } catch (error) {
      console.error("Error finding or creating user:", error);
    }
  }
}

export async function createThreadIfNotExists(api: Ifca, event: any) {
  try {
    // Kiểm tra xem kết nối đã được thiết lập chưa
    if (!sequelize.isDefined("Thread")) {
      await sequelize.authenticate();
      // Định nghĩa các model
      sequelize.addModels([Thread]);
      sequelize.sync();
    }

    // Tìm group theo tid (threadID)
    const thread = await Thread.findOne({ where: { tid: event.threadID } });
    if (!thread) {
      await api.getThreadInfo(event.threadID, async (err, res) => {
        // Thêm group vào cơ sở dữ liệu nếu không tồn tại
        const newThread = await Thread.create({
          tid: event.threadID,
          name: `${res.threadName}`,
          prefix: null,
          rankup: false,
          resend: false,
        });
        const arrPersonJoin = await event.logMessageData.addedParticipants.map(
          (item) => {
            return {
              tag: item.fullName,
              id: item.userFbId,
            };
          },
        );
        const UID_BOT = api.getCurrentUserID();
        if (arrPersonJoin.some(async (item) => item.id == (await UID_BOT))) {
          api.changeNickname(
            `${config.botname} • [pangolin]`,
            event.threadID,
            await UID_BOT,
          );
          api.sendMessage(
            global.getLang("AddBot", config.prefix),
            event.threadID,
          );
        }
        console.log("New thread created:", newThread.name, "|", newThread.tid);
      });
    }
  } catch (error) {
    console.error("Error finding or creating thread:", error);
  }
}

export async function deleteThread(api: Ifca, event: any) {
  try {
    // Kiểm tra xem kết nối đã được thiết lập chưa
    if (!sequelize.isDefined("Thread")) {
      await sequelize.authenticate();
      // Định nghĩa các model
      sequelize.addModels([Thread]);
      sequelize.sync();
    }
    // Xoá group khỏi cơ sở dữ liệu
    await Thread.destroy({ where: { tid: event.threadID } });
    console.log("Thread deleted");
  } catch (error) {
    console.error("Error", error);
  }
}
export async function deleteUserInThread(api: Ifca, event: any) {
  try {
    // Kiểm tra xem kết nối đã được thiết lập chưa
    if (!sequelize.isDefined("Thread")) {
      await sequelize.authenticate();
      // Định nghĩa các model
      sequelize.addModels([UserInThread]);
      sequelize.sync();
    }
    // Xoá user khỏi cơ sở dữ liệu
    await UserInThread.destroy({
      where: {
        uid: event.logMessageData.leftParticipantFbId,
        tid: event.threadID,
      },
    });
    console.log("User deleted from thread");
  } catch (error) {
    console.error("Error", error);
  }
}

export async function logMessageUserInThread(api, event) {
  if (event.type == "message") {
    try {
      // Kiểm tra xem kết nối đã được thiết lập chưa
      if (!sequelize.isDefined("UserInThread")) {
        await sequelize.authenticate();
        // Định nghĩa các model
        sequelize.addModels([UserInThread]);
        sequelize.sync();
      }
      // Tìm người dùng theo uid (senderID)
      const user = await UserInThread.findOne({
        where: { uniqueId: `${event.senderID}${event.threadID}` },
      });
      if (!user) {
        // Thêm user vào cơ sở dữ liệu nếu không tồn tại
        const nameUser = await api.getUserInfo(
          event.senderID,
          (err, ret) => {},
        );
        await UserInThread.create({
          uid: event.senderID,
          exp: 0,
          name: `${nameUser[event.senderID].name}`,
          tid: event.threadID,
          uniqueId: `${event.senderID}${event.threadID}`,
        });
      } else {
        await UserInThread.update(
          { exp: user.exp + 1 },
          { where: { uniqueId: `${event.senderID}${event.threadID}` } },
        );

        //update message of day
        const userOfDay = await UserInThread.findOne({
          where: { uniqueId: `${event.senderID}${event.threadID}` },
        });
        if (userOfDay) {
          // Kiểm tra xem có phải là một ngày mới không
          const homNay = moment().startOf("day");
          const lastDayUpdate = moment(userOfDay.lastDayUpdate).startOf("day");

          if (!lastDayUpdate.isSame(homNay, "day")) {
            // Nếu là một ngày mới, đặt lại countMessageOfDay
            await UserInThread.update(
              { countMessageOfDay: 1, lastDayUpdate: new Date() },
              { where: { uniqueId: `${event.senderID}${event.threadID}` } },
            );
          } else {
            // Nếu không phải là ngày mới, tăng countMessageOfDay lên 1
            await UserInThread.update(
              { countMessageOfDay: userOfDay.countMessageOfDay + 1 },
              { where: { uniqueId: `${event.senderID}${event.threadID}` } },
            );
          }
        }

        // Cập nhật số lượng tin nhắn trong tuần
        const userOfWeek = await UserInThread.findOne({
          where: { uniqueId: `${event.senderID}${event.threadID}` },
        });
        if (userOfWeek) {
          // Kiểm tra xem có phải là một tuần mới không
          const beginWeek = moment().startOf("isoWeek");
          const lastWeekUpdate = moment(userOfWeek.lastWeekUpdate).startOf(
            "isoWeek",
          );

          if (!lastWeekUpdate.isSame(beginWeek, "isoWeek")) {
            // Nếu là một tuần mới, đặt lại countMessageOfWeek
            await UserInThread.update(
              { countMessageOfWeek: 1, lastWeekUpdate: new Date() },
              { where: { uniqueId: `${event.senderID}${event.threadID}` } },
            );
          } else {
            // Nếu không phải là tuần mới, tăng countMessageOfWeek lên 1
            await UserInThread.update(
              { countMessageOfWeek: userOfWeek.countMessageOfWeek + 1 },
              { where: { uniqueId: `${event.senderID}${event.threadID}` } },
            );
          }
        }
      }
    } catch (error) {
      console.error("Error", error);
    }
  }
}
