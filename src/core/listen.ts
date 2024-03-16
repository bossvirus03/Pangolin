import * as cache from "memory-cache";
import sequelize from "src/database/database";
import { Thread } from "src/database/models/threadModel";
import { User } from "src/database/models/userModel";

class Listen {
  constructor(
    private api: any,
    private client: any
  ) {}

  async createUserIfNotExists(api, event: any) {
    try {
      // Kiểm tra xem kết nối đã được thiết lập chưa
      if (!sequelize.isDefined("User")) {
        await sequelize.authenticate();
        // Định nghĩa các model
        sequelize.addModels([User]);
      }

      // Tìm người dùng theo uid (senderID)
      const user = await User.findOne({ where: { uid: event.senderID } });
      if (!user) {
        // Thêm user vào cơ sở dữ liệu nếu không tồn tại
        const nameUser = await api.getUserInfo(
          event.senderID,
          (err, ret) => {}
        );
        const newUser = await User.create({
          uid: event.senderID,
          exp: 0,
          money: 0,
          name: `${nameUser[event.senderID].name}`,
          prefix: null,
        });
        console.log("New user created:", newUser.toJSON());
      } else {
        await User.update(
          { exp: user.exp + 1 },
          { where: { uid: event.senderID } }
        );
      }
    } catch (error) {
      console.error("Error finding or creating user:", error);
    }
  }

  async createThreadIfNotExists(api, event: any) {
    try {
      // Kiểm tra xem kết nối đã được thiết lập chưa
      if (!sequelize.isDefined("Thread")) {
        await sequelize.authenticate();
        // Định nghĩa các model
        sequelize.addModels([Thread]);
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
            rankup: true,
          });
          console.log("New thread created:", newThread.toJSON());
        });
      }
    } catch (error) {
      console.error("Error finding or creating thread:", error);
    }
  }

  async deleteThreadIfNotExists(api, event: any) {
    try {
      // Kiểm tra xem kết nối đã được thiết lập chưa
      if (!sequelize.isDefined("Thread")) {
        await sequelize.authenticate();
        // Định nghĩa các model
        sequelize.addModels([Thread]);
      }
      // Xoá group khỏi cơ sở dữ liệu
      await Thread.destroy({ where: { tid: event.threadID } });
      console.log("Thread deleted");
    } catch (error) {
      console.error("Error", error);
    }
  }

  UserData = {
    get: async (uid) => {
      const user = await User.findOne({ where: { uid } });
      if (!user) return null;
      return user.dataValues;
    },
    del: async (uid) => {
      return await User.destroy({ where: { uid } });
    },
  };

  ThreadData = {
    get: async (tid) => {
      const res = await Thread.findOne({ where: { tid } });
      if (!res) return null;
      return res.dataValues;
    },
    prefix: async (tid) => {
      const res = await Thread.findOne({ where: { tid } });
      if (!res) return null;
      return res.dataValues.prefix;
    },
    rankup: {
      get: async (tid) => {
        const res = await Thread.findOne({ where: { tid } });
        if (!res) return null;
        return res.dataValues.rankup;
      },
      set: async (tid, bool: boolean) => {
        const res = await Thread.update({ rankup: bool }, { where: { tid } });
        console.log(res);
        return res;
      },
    },
  };
  listen() {
    for (let i = 0; i < this.client.onload.length; i++) {
      this.client.onload[i].onload(this.api, this.client);
    }
    this.api.setOptions({ listenEvents: true });
    this.api.listenMqtt(async (err, event) => {
      if (!event) return;
      if (event.type == "message") {
        try {
          await sequelize.sync(); // Tạo bảng nếu chưa tồn tại
          await this.createUserIfNotExists(this.api, event);
        } catch (error) {
          console.error("Error occurred:", error);
        }
      }
      if (
        event.type == "event" &&
        event.logMessageType == "log:subscribe" &&
        event.logMessageData.addedParticipants[0].userFbId ==
          process.env.UID_BOT
      ) {
        try {
          await sequelize.sync(); // Tạo bảng nếu chưa tồn tại
          await this.createThreadIfNotExists(this.api, event);
        } catch (error) {
          console.error("Error occurred:", error);
        }
      }
      if (
        event.type == "event" &&
        event.logMessageType == "log:unsubscribe" &&
        event.logMessageData.leftParticipantFbId == process.env.UID_BOT
      ) {
        try {
          await sequelize.sync(); // Tạo bảng nếu chưa tồn tại
          await this.deleteThreadIfNotExists(this.api, event);
        } catch (error) {
          console.error("Error occurred:", error);
        }
      }

      // load all event
      this.client.events.forEach((value, key) => {
        this.client.events
          .get(key)
          .run(this.api, event, this.client, this.UserData, this.ThreadData);
      });

      //load all command event
      this.client.event.forEach((value, key) => {
        this.client.event
          .get(key)
          .event(this.api, event, this.client, this.UserData, this.ThreadData);
      });

      if (event.body == undefined) return;
      let args = event.body.trim().split(" ");
      let listNoprefix = [];
      this.client.noprefix.forEach((value, key) => {
        listNoprefix.push(key);
      });

      if (listNoprefix.includes(args[0])) {
        this.client.noprefix
          .get(args[0])
          .noprefix(
            this.api,
            event,
            this.client,
            args,
            this.UserData,
            this.ThreadData
          );
      }

      let listCommands = [];

      const PREFIX =
        (await this.ThreadData.prefix(event.threadID)) ||
        this.client.config.PREFIX;
      args = event.body.slice(PREFIX.length).trim().split(" ");

      this.client.commands.forEach((value, key) => {
        listCommands.push(key);
      });

      //load command when cache has command-event-on
      let commandEventOn = cache.get("command-event-on") ?? [];
      if (commandEventOn) {
        if (event.body.startsWith(PREFIX)) {
          if (listCommands.includes(args[0])) {
            this.client.commands
              .get(args[0])
              .run(
                this.api,
                event,
                this.client,
                args,
                this.UserData,
                this.ThreadData
              );
          } else {
            this.api.sendMessage("Lệnh của bạn không hợp lệ!!", event.threadID);
          }
        } else {
          commandEventOn.forEach((command) => {
            this.client.commands
              .get(command.command)
              .run(
                this.api,
                event,
                this.client,
                args,
                this.UserData,
                this.ThreadData
              );
          });
        }
      }
      //load all command
      else {
        if (!event.body.startsWith(PREFIX)) return;
        if (!listCommands.includes(args[0])) {
          return this.api.sendMessage(
            "Lệnh của bạn không hợp lệ!!",
            event.messageID,
            event.threadID
          );
        }
        this.client.commands
          .get(args[0])
          .run(
            this.api,
            event,
            this.client,
            args,
            this.UserData,
            this.ThreadData
          );
      }
    });
  }
}
export default Listen;
