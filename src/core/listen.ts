import { readdirSync } from "fs";
import * as cache from "memory-cache";
import { join } from "path";
import sequelize from "src/db/database";
import { Thread } from "src/db/models/threadModel";
import { UserInThread } from "src/db/models/userInThreadModel";
import { User } from "src/db/models/userModel";
import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import * as stringSimilarity from "string-similarity";

class Listen {
  constructor(
    private api: Ifca,
    private client: any
  ) {}

  async createUserIfNotExists(api: Ifca, event: IEvent) {
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

  async createThreadIfNotExists(api: Ifca, event: any) {
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

  async deleteThread(api: Ifca, event: any) {
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

  async logMessageUserInThread(api, event) {
    try {
      // Kiểm tra xem kết nối đã được thiết lập chưa
      if (!sequelize.isDefined("UserInThread")) {
        await sequelize.authenticate();
        // Định nghĩa các model
        sequelize.addModels([UserInThread]);
      }
      // Tìm người dùng theo uid (senderID)
      const user = await UserInThread.findOne({
        where: { uid: event.senderID, tid: event.threadID },
      });
      if (!user) {
        // Thêm user vào cơ sở dữ liệu nếu không tồn tại
        const nameUser = await api.getUserInfo(
          event.senderID,
          (err, ret) => {}
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
          { where: { uniqueId: `${event.senderID}${event.threadID}` } }
        );
      }
    } catch (error) {
      console.error("Error", error);
    }
  }
  UserData = {
    set: async (uid, name) => {
      try {
        const check = await User.findOne({ where: { uid } });
        console.log(check, uid);
        if (check) return;
        const newUser = await User.create({
          uid: uid,
          exp: 0,
          money: 0,
          name: name,
          prefix: null,
        });
        console.log("New user created:", newUser.toJSON());
      } catch (error) {
        console.error("Error creating new user:", error);
        throw error;
      }
    },

    getAll: async () => {
      try {
        const res = await User.findAll();
        return res;
      } catch (error) {
        console.error("Error getting all users:", error);
        throw error;
      }
    },

    get: async (uid) => {
      try {
        const user = await User.findOne({ where: { uid } });
        return user ? user.dataValues : null;
      } catch (error) {
        console.error("Error getting user by id:", error);
        throw error;
      }
    },

    del: async (uid) => {
      try {
        return await User.destroy({ where: { uid } });
      } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
      }
    },
  };

  ThreadData = {
    set: async (tid, name) => {
      try {
        const check = await Thread.findOne({ where: { tid } });
        if (check) return;
        const newThread = await Thread.create({
          tid: tid,
          name: name,
          prefix: null,
          rankup: true,
        });
        console.log("New thread created:", newThread.toJSON());
      } catch (error) {
        console.error("Error creating new thread:", error);
      }
    },

    setPrefix: async (tid, prefix) => {
      try {
        const res = await Thread.update({ prefix }, { where: { tid } });
        return res;
      } catch (error) {
        console.error("Error updating prefix:", error);
        throw error;
      }
    },

    getAll: async () => {
      try {
        const res = await Thread.findAll();
        return res;
      } catch (error) {
        console.error("Error getting all threads:", error);
        throw error;
      }
    },

    get: async (tid) => {
      try {
        const res = await Thread.findOne({ where: { tid } });
        return res ? res.dataValues : null;
      } catch (error) {
        console.error("Error getting thread by id:", error);
        throw error;
      }
    },

    prefix: async (tid) => {
      try {
        const res = await Thread.findOne({ where: { tid } });
        return res ? res.dataValues.prefix : null;
      } catch (error) {
        console.error("Error getting prefix by id:", error);
        throw error;
      }
    },

    rankup: {
      get: async (tid) => {
        try {
          const res = await Thread.findOne({ where: { tid } });
          return res ? res.dataValues.rankup : null;
        } catch (error) {
          console.error("Error getting rankup status:", error);
          throw error;
        }
      },

      set: async (tid, bool) => {
        try {
          const res = await Thread.update({ rankup: bool }, { where: { tid } });
          return res;
        } catch (error) {
          console.error("Error setting rankup status:", error);
          throw error;
        }
      },
    },
  };

  UserInThreadData = {
    get: async (uid, tid) => {
      try {
        const res = await UserInThread.findOne({
          where: { uniqueId: `${uid}${tid}` },
        });
        return res ? res.dataValues : null;
      } catch (error) {
        console.error("Error getting user in thread:", error);
        throw error;
      }
    },

    set: async (uid, name, tid) => {
      try {
        const check = await UserInThread.findOne({
          where: { uniqueId: `${uid}${tid}` },
        });
        if (check) return;
        const res = await UserInThread.create({
          uid,
          name,
          tid,
          uniqueId: `${uid}${tid}`,
        });
        return res;
      } catch (error) {
        console.error("Error creating user in thread:", error);
        throw error;
      }
    },

    getAll: async () => {
      try {
        const res = await UserInThread.findAll();
        return res;
      } catch (error) {
        console.error("Error getting all users in threads:", error);
        throw error;
      }
    },
  };

  listen() {
    const commandPath = join(process.cwd(), "src", "modules", "commands");
    const commandFiles = readdirSync(commandPath).filter((file: string) =>
      file.endsWith(".ts")
    );
    let listCommands = [];
    for (const file of commandFiles) {
      const filePath = join(commandPath, file);
      const CommandClass = require(filePath).default;
      if (!CommandClass) continue;
      const { config } = CommandClass;
      listCommands.push(config.name);
    }
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
        if (event.isGroup) {
          try {
            await this.logMessageUserInThread(this.api, event);
          } catch (error) {
            console.error("Error occurred:", error);
          }
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
          await sequelize.sync();
          await this.deleteThread(this.api, event);
        } catch (error) {
          console.error("Error occurred:", error);
        }
      }

      // load all event
      this.client.events.forEach((value, key) => {
        this.client.events
          .get(key)
          .run(
            this.api,
            event,
            this.client,
            this.UserData,
            this.ThreadData,
            this.UserInThreadData
          );
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
      // let commandEventOn = cache.get("command-event-on") ?? [];
      // if (commandEventOn) {
      //   if (event.body.startsWith(PREFIX)) {
      //     if (!isPermission) return;
      //     if (listCommands.includes(args[0])) {
      //       this.client.commands
      //         .get(args[0])
      //         .run(
      //           this.api,
      //           event: IEvent,
      //           this.client,
      //           args,
      //           this.UserData,
      //           this.ThreadData
      //         );
      //     } else {
      //       var matches = stringSimilarity.findBestMatch(args[0], listCommands);
      //       this.api.sendMessage(
      //         `Lệnh của bạn không hợp lệ! Có phải bạn muốn sử dụng lệnh ${listCommands[matches.bestMatchIndex]}?`,
      //         event.threadID
      //       );
      //     }
      //   } else {
      //     commandEventOn.forEach((command) => {
      //       this.client.commands
      //         .get(command.command)
      //         .run(
      //           this.api,
      //           event: IEvent,
      //           this.client,
      //           args,
      //           this.UserData,
      //           this.ThreadData
      //         );
      //     });
      //   }
      // }
      //load all command
      // else
      if (isPermission) {
        if (!event.body.startsWith(PREFIX)) return;
        if (!listCommands.includes(args[0])) {
          var matches = stringSimilarity.findBestMatch(args[0], listCommands);
          return this.api.sendMessage(
            `Lệnh của bạn không hợp lệ! Có phải bạn muốn sử dụng lệnh ${listCommands[matches.bestMatchIndex]}?`,
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
            this.ThreadData,
            this.UserInThreadData
          );
      }
    });
  }
}
export default Listen;
