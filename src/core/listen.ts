import { join } from "path";
import sequelize from "./../db/database";
import { Thread } from "./../db/models/threadModel";
import { UserInThread } from "./../db/models/userInThreadModel";
import { User } from "./../db/models/userModel";
import ConfigGuideLang from "./../lang/LangConfig";
import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import * as stringSimilarity from "string-similarity";
import * as fs from "fs";
import * as cache from "memory-cache";
import {
  createThreadIfNotExists,
  createUserIfNotExists,
  deleteThread,
  deleteUserInThread,
  logMessageUserInThread,
} from "./../utils";
import { checkPermission } from "./handleCommand";

class Listen {
  constructor(
    private api: Ifca,
    private client: any,
  ) {}

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
          console.log(
            global.getLang("UserCreated", `${newUser.name} | ${newUser.uid}`),
          );
        } catch (error) {
          console.error("Error creating new user:", error);
          throw error;
        }
      }
    },
    setMoney: async (uid, money) => {
      if (uid && money) {
        try {
          const res = await User.update({ money }, { where: { uid } });
          return res;
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
        await User.destroy({ where: { uid } });
        return;
      } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
      }
    },
  };

  ThreadData = {
    set: async (tid, name, emoji, imageSrc, color) => {
      try {
        const check = await Thread.findOne({ where: { tid } });
        if (check) return;
        const newThread = await Thread.create({
          tid: tid,
          name: name,
          prefix: null,
          emoji,
          imageSrc,
          color,
          rankup: false,
          resend: false,
        });
        console.log("New thread created:", newThread.name, "|", newThread.tid);
      } catch (error) {
        console.error("Error creating new thread:", error);
      }
    },

    setPrefix: async (tid, prefix) => {
      try {
        const res = await Thread.update({ prefix }, { where: { tid } });
        return;
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
          return;
        } catch (error) {
          console.error("Error setting rankup status:", error);
          throw error;
        }
      },
    },
    joinLeaveNoti: {
      get: async (tid) => {
        try {
          const res = await Thread.findOne({ where: { tid } });
          return res ? res.dataValues.joinLeaveNoti : false;
        } catch (error) {
          console.error("Error getting joinLeaveNoti status:", error);
          throw error;
        }
      },

      set: async (tid, bool) => {
        try {
          const res = await Thread.update(
            { joinLeaveNoti: bool },
            { where: { tid } },
          );
          return;
        } catch (error) {
          console.error("Error setting joinLeaveNoti status:", error);
          throw error;
        }
      },
    },
    resend: {
      get: async (tid) => {
        try {
          const res = await Thread.findOne({ where: { tid } });
          return res ? res.dataValues.resend : false;
        } catch (error) {
          console.error("Error getting resend status:", error);
          throw error;
        }
      },

      set: async (tid, bool) => {
        try {
          const res = await Thread.update({ resend: bool }, { where: { tid } });
          return;
        } catch (error) {
          console.error("Error setting resend status:", error);
          throw error;
        }
      },
    },
    antichangeinfobox: {
      get: async (tid) => {
        try {
          const res = await Thread.findOne({ where: { tid } });
          return res ? res.dataValues.antichangeinfobox : false;
        } catch (error) {
          console.error("Error getting antichangeinfobox status:", error);
          throw error;
        }
      },

      set: async (tid, bool) => {
        try {
          const res = await Thread.update(
            { antichangeinfobox: bool },
            { where: { tid } },
          );
          return;
        } catch (error) {
          console.error("Error setting resend status:", error);
          throw error;
        }
      },
    },
    antileave: {
      get: async (tid) => {
        try {
          const res = await Thread.findOne({ where: { tid } });
          return res ? res.dataValues.antileave : false;
        } catch (error) {
          console.error("Error getting antileave status:", error);
          throw error;
        }
      },

      set: async (tid, bool) => {
        try {
          const res = await Thread.update(
            { antileave: bool },
            { where: { tid } },
          );
          return;
        } catch (error) {
          console.error("Error setting antileave status:", error);
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

  cacheReply = async (event) => {
    if (event && event.messageReply)
      return await cache.get(`handleReply${event.messageReply.messageID}`);
  };

  cacheReaction = async (event) => {
    if (event.type == "message_reaction")
      return await cache.get(`handleReaction${event.messageID}`);
  };

  async listen() {
    const UID_BOT = this.api.getCurrentUserID();
    const configPath = join(process.cwd(), "pangolin.config.json");
    const dataConfig = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(dataConfig);
    sequelize.addModels([User, Thread, UserInThread]);
    await sequelize.sync();

    for (let i = 0; i < this.client.onload.length; i++) {
      this.client.onload[i].onload({
        api: this.api,
        client: this.client,
        UserData: this.UserData,
        ThreadData: this.ThreadData,
        UserInThreadData: this.UserInThreadData,
        pangolin: config,
      });
    }
    this.api.setOptions({ listenEvents: true, selfListen: config.self_listen });
    this.api.listenMqtt(async (err, event: IEvent) => {
      // create user if not already
      try {
        await createUserIfNotExists(this.api, event);
      } catch (error) {
        global.getLang("ErrorOccurred", error);
      }
      if (event.isGroup) {
        try {
          await logMessageUserInThread(this.api, event);
        } catch (error) {
          global.getLang("ErrorOccurred", error);
        }
      }
      if (!event) return;
      if (config.log_event) console.log(event);
      // Create a new thread when the bot is added to a group
      if (
        event.type == "event" &&
        event.logMessageType == "log:subscribe" &&
        event.logMessageData.addedParticipants[0].userFbId == UID_BOT
      ) {
        try {
          await sequelize.sync(); // Tạo bảng nếu chưa tồn tại
          await createThreadIfNotExists(this.api, event);
        } catch (error) {
          global.getLang("ErrorOccurred", error);
        }
      }

      // Delete thread when the bot is removed
      if (
        event.type == "event" &&
        event.logMessageType == "log:unsubscribe" &&
        event.logMessageData.leftParticipantFbId == UID_BOT
      ) {
        try {
          await sequelize.sync();
          await deleteThread(this.api, event);
        } catch (error) {
          global.getLang("ErrorOccurred", error);
        }
      }

      // Delete a user of threads data when a user is removed or leave
      if (event.type == "event" && event.logMessageType == "log:unsubscribe") {
        try {
          await sequelize.sync();
          await deleteUserInThread(this.api, event);
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
        this.client.events.get(key).run({
          api: this.api,
          event,
          client: this.client,
          UserData: this.UserData,
          ThreadData: this.ThreadData,
          UserInThreadData: this.UserInThreadData,
          getLang,
          pangolin: config,
        });
      });

      //load all command event
      this.client.handleEvent.forEach((value, key) => {
        const configGuideLang = new ConfigGuideLang(this.client, key);
        function getLang(key, ...args: any[]) {
          const message = configGuideLang.getLang(key, args);
          return message;
        }
        this.client.handleEvent.get(key).handleEvent({
          api: this.api,
          event,
          client: this.client,
          UserData: this.UserData,
          ThreadData: this.ThreadData,
          UserInThreadData: this.UserInThreadData,
          getLang,
          pangolin: config,
        });
      });

      //load all command reply
      const messageReply = global.client.messageReply;
      if (event.type === "message_reply") {
        for (const item of messageReply) {
          if (item.messageID === event.messageReply.messageID) {
            this.client.handleReply.forEach(async (value, key) => {
              const configGuideLang = new ConfigGuideLang(this.client, key);
              function getLang(key, ...args: any[]) {
                const message = configGuideLang.getLang(key, args);
                return message;
              }
              this.client.handleReply.get(key).handleReply({
                api: this.api,
                event,
                client: this.client,
                UserData: this.UserData,
                ThreadData: this.ThreadData,
                UserInThreadData: this.UserInThreadData,
                getLang,
                pangolin: config,
                messageReply: item,
              });
            });
          }
        }
      }
      //load all command reaction
      const messageReaction = global.client.messageReaction;
      if (event.type === "message_reaction") {
        for (const item of messageReaction) {
          if (item.messageID === event.messageID) {
            this.client.handleReaction.forEach(async (value, key) => {
              const configGuideLang = new ConfigGuideLang(this.client, key);
              function getLang(key, ...args: any[]) {
                const message = configGuideLang.getLang(key, args);
                return message;
              }
              this.client.handleReaction.get(key).handleReaction({
                api: this.api,
                event,
                client: this.client,
                UserData: this.UserData,
                ThreadData: this.ThreadData,
                UserInThreadData: this.UserInThreadData,
                getLang,
                pangolin: config,
                messageReaction: item,
              });
            });
          }
        }
      }
      if (event.body != undefined) {
        let args = (event.body as string).trim().split(" ");
        let configGuideLang = new ConfigGuideLang(this.client, args[0]);
        function getLang(key, ...args) {
          const message = configGuideLang.getLang(key, args);
          return message;
        }
        let listNoprefix = [];
        this.client.noprefix.forEach((value, key) => {
          listNoprefix.push(key);
        });

        if (listNoprefix.includes(args[0])) {
          this.client.noprefix.get(args[0]).noprefix({
            api: this.api,
            event,
            client: this.client,
            args,
            UserData: this.UserData,
            ThreadData: this.ThreadData,
            UserInThreadData: this.UserInThreadData,
            getLang,
            pangolin: config,
          });
        }

        let listCommands = [];
        const PREFIX =
          (await this.ThreadData.prefix(event.threadID)) ||
          config.prefix ||
          ";";
        args = (event.body as string).slice(PREFIX.length).trim().split(" ");

        this.client.commands.forEach((value, key) => {
          listCommands.push(key);
        });
        const isPermission = await checkPermission(
          this.client,
          this.api,
          event,
          config,
          args,
          PREFIX,
        );

        if (!(event.body as string).startsWith(PREFIX)) return;
        if (!listCommands.includes(args[0])) {
          var matches = stringSimilarity.findBestMatch(args[0], listCommands);
          return this.api.sendMessage(
            global.getLang(
              "InvalidCommand",
              listCommands[matches.bestMatchIndex],
            ),
            event.threadID,
          );
        }
        if (isPermission) {
          configGuideLang = new ConfigGuideLang(this.client, args[0]);
          function getLang(key, ...args: any[]) {
            const message = configGuideLang.getLang(key, args);
            return message;
          }
          // load all command
          this.client.commands.get(args[0]).run({
            api: this.api,
            event,
            client: this.client,
            args,
            UserData: this.UserData,
            ThreadData: this.ThreadData,
            UserInThreadData: this.UserInThreadData,
            getLang,
            pangolin: config,
          });
        }
      }
    });
  }
}
export default Listen;
