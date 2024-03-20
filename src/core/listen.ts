import { readdirSync } from "fs";
import * as cache from "memory-cache";
import { join } from "path";
import { env } from "process";
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
        console.log(nameUser);
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
    set: async (uid, name) => {
      const newUser = await User.create({
        uid: uid,
        exp: 0,
        money: 0,
        name: name,
        prefix: null,
      });
      console.log("New user created:", newUser.toJSON());
    },
    getAll: async () => {
      const res = await User.findAll();
      if (!res) return null;
      return res;
    },
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
    set: async (tid, name) => {
      const newThread = await Thread.create({
        tid: tid,
        name: name,
        prefix: null,
        rankup: true,
      });
      console.log("New thread created:", newThread.toJSON());
    },
    setPrefix: async (tid, prefix) => {
      const res = await Thread.update({ prefix }, { where: { tid } });
      return res;
    },
    getAll: async () => {
      const res = await Thread.findAll();
      if (!res) return null;
      return res;
    },
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
        this.client.config.PREFIX ||
        ";";
      args = event.body.slice(PREFIX.length).trim().split(" ");

      this.client.commands.forEach((value, key) => {
        listCommands.push(key);
      });

      async function checkPermission(client, api) {
        const ADMINS = process.env.ADMINS;
        const commandPath = join(process.cwd(), "src", "modules", "commands");
        const commandFiles = readdirSync(commandPath).filter((file: string) =>
          file.endsWith(".ts")
        );
        for (const file of commandFiles) {
          const filePath = join(commandPath, file);
          const CommandClass = require(filePath).default;
          if (!CommandClass) continue;
          const { config } = CommandClass;
          const commandInstance = new CommandClass(client);
          if (commandInstance.run) {
            if (config.name == args[0]) {
              if (config.permission == 1) {
                let isPermission = true;
                try {
                  const info: { adminIDs: { id: string }[] } =
                    await new Promise((resolve, reject) => {
                      api.getThreadInfo(event.threadID, (err, info) => {
                        if (err) reject(err);
                        else resolve(info);
                      });
                    });

                  for (const item of info.adminIDs) {
                    if (item.id !== event.senderID) {
                      await api.sendMessage(
                        `Bạn không có quyền sử dụng lệnh này, vui lòng sử dụng ${PREFIX}help ${config.name} để xem chi tiết!`,
                        event.threadID
                      );
                      isPermission = false;
                    }
                  }
                  return isPermission;
                } catch (error) {
                  // Handle error
                  console.error("Error occurred:", error);
                  return false; // Assuming permission is denied in case of error
                }
              }

              // check permissions for admin bot
              else if (config.permission == 2) {
                let isPermission = true;
                const ADS = JSON.parse(ADMINS);
                let isAdmin = 0;
                for (let id of ADS) {
                  if (id != event.senderID) {
                    isAdmin++;
                  }
                }
                if (isAdmin == ADS.length) {
                  api.sendMessage(
                    `Bạn không có quyển sử dụng lệnh này, vui lòng sử dụng ${PREFIX}help ${config.name} để xem chi tiết!`,
                    event.threadID
                  );
                  isPermission = false;
                }
                return isPermission;
              } else {
                return true;
              }
            } else {
              return true;
            }
          }
        }
      }
      const isPermission = await checkPermission(this.client, this.api);
      //load command when cache has command-event-on
      let commandEventOn = cache.get("command-event-on") ?? [];
      if (commandEventOn) {
        if (event.body.startsWith(PREFIX)) {
          if (!isPermission) return;
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
      else if (isPermission) {
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
