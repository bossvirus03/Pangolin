import { readdirSync } from "fs";
import { join } from "path";
import sequelize from "src/db/database";
import { Thread } from "src/db/models/threadModel";
import { UserInThread } from "src/db/models/userInThreadModel";
import { User } from "src/db/models/userModel";
import ConfigGuideLang from "src/lang/LangConfig";
import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import * as stringSimilarity from "string-similarity";

class Listen {
  constructor(
    private api: Ifca,
    private client: any
  ) {}

  async createUserIfNotExists(api: Ifca, event: IEvent) {
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
            (err, ret) => {}
          );
          const newUser = await User.create({
            uid: event.senderID,
            name: `${nameUser[event.senderID].name}`,
            exp: 0,
            money: 0,
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
  }

  async createThreadIfNotExists(api: Ifca, event: any) {
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
        sequelize.sync();
      }
      // Xoá group khỏi cơ sở dữ liệu
      await Thread.destroy({ where: { tid: event.threadID } });
      console.log("Thread deleted");
    } catch (error) {
      console.error("Error", error);
    }
  }

  async logMessageUserInThread(api, event) {
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
  }
  UserData = {
    set: async (uid, name) => {
      if (uid && name) {
        try {
          const check = await User.findOne({ where: { uid } });
          if (check) return;
          const newUser = await User.create({
            uid: uid,
            exp: 0,
            money: 0,
            name: name,
            prefix: null,
          });
          console.log(global.getLang("UserCreated", newUser.toJSON()));
        } catch (error) {
          console.error("Error creating new user:", error);
          throw error;
        }
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

  async listen() {
    sequelize.addModels([User, Thread, UserInThread]);
    await sequelize.sync();
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
      try {
        await this.createUserIfNotExists(this.api, event);
      } catch (error) {
        global.getLang("ErrorOccurred", error);
      }
      if (event.isGroup) {
        try {
          await this.logMessageUserInThread(this.api, event);
        } catch (error) {
          global.getLang("ErrorOccurred", error);
        }
      }
      if (!event) return;
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
          global.getLang("ErrorOccurred", error);
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
          global.getLang("ErrorOccurred", error);
        }
      }

      // load all event
      this.client.events.forEach((value, key) => {
        const configGuideLang = new ConfigGuideLang(this.client, key);
        function getLang(key, ...args: any[]) {
          const message = configGuideLang.getLang(key, args);
          return message;
        }
        this.client.events
          .get(key)
          .run(
            this.api,
            event,
            this.client,
            this.UserData,
            this.ThreadData,
            this.UserInThreadData,
            getLang
          );
      });

      //load all command event
      this.client.event.forEach((value, key) => {
        this.client.event
          .get(key)
          .event(
            this.api,
            event,
            this.client,
            this.UserData,
            this.ThreadData,
            this.UserInThreadData
          );
      });
      if (event.body != undefined) {
        let args = event.body.trim().split(" ");
        let configGuideLang = new ConfigGuideLang(this.client, args[0]);
        function getLangNoprefix(key, ...args) {
          const message = configGuideLang.getLang(key, args);
          return message;
        }
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
              this.ThreadData,
              this.UserInThreadData,
              getLangNoprefix
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
        async function checkPermission(client, api: Ifca) {
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
                // check permissions group admin
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
                          global.getLang("Unauthorized", PREFIX, config.name),
                          event.threadID
                        );
                        isPermission = false;
                      }
                    }
                    return isPermission;
                  } catch (error) {
                    global.getLang("ErrorOccurred", error);

                    return false;
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
                      global.getLang("Unauthorized", PREFIX, config.name),
                      event.threadID
                    );
                    isPermission = false;
                  }
                  return isPermission;
                } else {
                  return true;
                }
              }
            }
          }
        }
        const isPermission = await checkPermission(this.client, this.api);

        if (!event.body.startsWith(PREFIX)) return;
        if (!listCommands.includes(args[0])) {
          var matches = stringSimilarity.findBestMatch(args[0], listCommands);
          return this.api.sendMessage(
            global.getLang(
              "InvalidCommand",
              listCommands[matches.bestMatchIndex]
            ),
            event.threadID
          );
        }
        if (isPermission) {
          configGuideLang = new ConfigGuideLang(this.client, args[0]);
          function getLang(key, ...args: any[]) {
            const message = configGuideLang.getLang(key, args);
            return message;
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
              this.UserInThreadData,
              getLang
            );
        }
      }
    });
  }
}
export default Listen;
