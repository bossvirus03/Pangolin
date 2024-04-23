import { join } from "path";
import * as fs from "fs";
import * as cache from "memory-cache";
import {
  IPangolinHandleEvent,
  IPangolinRun,
} from "src/types/type.pangolin-handle";
export default class RuleCommand {
  static config = {
    category: "GROUP",
    name: "rule",
    version: "1.0.0",
    author: "Lợi",
    guide: {
      vi: "[prefix]rule [add/remove]",
      en: "[prefix]rule [add/remove]",
    },
    description: {
      vi: "xem, thêm, xoá các luật lệ của nhóm",
      en: "View, add, delete group rules",
    },
  };

  static message = {
    vi: {
      notGroup: "Đây không phải 1 nhóm!",
      syntaxError: "Sai cú pháp!",
      pleaseWriteRule: "Vui lòng viết rule!",
      add: "Đã thêm $0 vào danh sách rules!",
      del: "Đã xóa thành công rule $0!!",
      notFound: "Rule không tồn tại",
      needIndex: "Bạn cần nhập index của rule!",
      greaterThan0: "Rule phải lớn hơn 0!",
      isNumber: "Rule phải là số!",
      list: "--------$0--------\nDanh sách các rules trong nhóm:\n",
      needReply:
        "\nreply add [rule] để thêm rule hoặc remove [rule index] để xoá rule",
    },
    en: {
      isNumber: "Rule must be a number!",
      list: "--------$0--------\nList of rules in the group:\n",
      greaterThan0: "Rule must be greater than 0!",
      notGroup: "This is not a group!",
      syntaxError: "Sai cú pháp!",
      pleaseWriteRule: "Please write a rule!",
      add: "Added $0 to the rules list!",
      del: "Successfully deleted rule ${ruleIndex}!!",
      notFound: "Rule does not exist",
      needIndex: "You need to enter the index of the rule!",
      needReply:
        "\nreply add [rule] to add a rule or remove [rule index] to delete a rule",
    },
  };
  constructor(private client) {}
  pathDataRule = join(process.cwd(), "/src/db/data/rule.json");
  async handleRemoveRule(ruleIndex: number, event, api, getLang) {
    const previousRule = fs.readFileSync(this.pathDataRule, "utf8");
    const previousRuleArray = JSON.parse(previousRule);
    for (let dataRule of previousRuleArray) {
      if (dataRule.threadID == event.threadID) {
        if (dataRule.rules.length < ruleIndex) {
          return api.sendMessage(getLang("notFound"), event.threadID);
        }
        const newDataRule = dataRule.rules.filter((rule, index) => {
          return ++index != ruleIndex;
        });
        const dataRuleAfterUpdate = previousRuleArray.map((rule, index) => {
          if (rule.threadID == event.threadID) {
            return {
              threadID: rule.threadID,
              rules: newDataRule,
            };
          }
          return rule;
        });
        fs.writeFileSync(
          this.pathDataRule,
          JSON.stringify(dataRuleAfterUpdate),
          {
            encoding: "utf-8",
          },
        );
        api.sendMessage(getLang("del", ruleIndex), event.threadID);
      }
    }
  }

  async handleAddRule(rule, event, api, getLang) {
    let ruleThread = [
      {
        threadID: event.threadID,
        rules: [rule],
      },
    ];
    const previousRule = fs.readFileSync(this.pathDataRule, "utf8");
    if (previousRule) {
      const previousRuleArray = JSON.parse(previousRule);
      const isDuplicate = previousRuleArray.some((item) => {
        return item.threadID == event.threadID;
      });
      if (isDuplicate) {
        const newRule = previousRuleArray.map((item) => {
          if (item.threadID == event.threadID) {
            return {
              threadID: event.threadID,
              rules: [...item.rules, rule],
            };
          } else {
            return item;
          }
        });
        await fs.writeFileSync(this.pathDataRule, JSON.stringify(newRule), {
          encoding: "utf-8",
        });
      } else {
        const newRuleUser = ruleThread.concat(previousRuleArray);
        await fs.writeFileSync(this.pathDataRule, JSON.stringify(newRuleUser), {
          encoding: "utf-8",
        });
      }
    } else {
      fs.writeFileSync(this.pathDataRule, JSON.stringify(ruleThread), {
        encoding: "utf-8",
      });
    }
    api.sendMessage(getLang("add"), event.threadID);
  }
  async handleEvent({ api, event, getLang }: IPangolinHandleEvent) {
    if (event.type === "message_reply") {
      if (event.messageReply.messageID == cache.get("tmp-rule-message")) {
        if ((event.body as string).startsWith("remove")) {
          const index = (event.body as string).split("remove")[1].trim();
          if (!/^\d+(\.\d+)?$/.test(index)) {
            return api.sendMessage(getLang("isNumber"), event.threadID);
          }
          this.handleRemoveRule(parseInt(index), event, api, getLang);
        }
        if ((event.body as string).startsWith("add")) {
          const rule: string = (event.body as string).split("add")[1].trim();
          this.handleAddRule(rule, event, api, getLang);
        }
      }
    }
  }
  async run({ api, event, getLang, args }: IPangolinRun) {
    if (!event.isGroup)
      return api.sendMessage(getLang("notGroup"), event.threadID);
    if (args[1] === "add") {
      const rule = (event.body as string).split(args[1])[1].trim();
      if (!rule)
        return api.sendMessage(getLang("pleaseWriteRule"), event.threadID);
      this.handleAddRule(rule, event, api, getLang);
    }
    if (args[1] === "remove") {
      if (!args[2])
        return api.sendMessage(getLang("needIndex"), event.threadID);
      console.log(!/^\d+(\.\d+)?$/.test(args[2]));
      if (!/^\d+(\.\d+)?$/.test(args[2])) {
        return api.sendMessage(getLang("isNumber"), event.threadID);
      } else {
        if (args[2] == 0) {
          return api.sendMessage(getLang("greaterThan0"), event.threadID);
        } else {
          try {
            await this.handleRemoveRule(args[2], event, api, getLang);
          } catch (error) {
            console.log(error);
          }
        }
      }
    } else {
      const previousWarn = fs.readFileSync(this.pathDataRule, "utf8");
      const previousWarnArray = JSON.parse(previousWarn);
      const ruleOfThread = previousWarnArray.filter(
        (item) => item.threadID === event.threadID,
      );
      const name = await new Promise((resolve, reject) => {
        api.getThreadInfo(event.threadID, (err, info) => {
          if (err) return reject(err);
          else resolve(info.name);
        });
      });
      let smg = await getLang("list", name);

      ruleOfThread[0].rules.forEach((item, index) => {
        smg += `  ${++index}. ${item}\n`;
      });
      smg += getLang("needReply");

      api.sendMessage(
        smg,
        event.threadID,
        (err, message) => {
          cache.put("tmp-rule-message", message.messageID, 1000 * 5 * 60);
        },
        event.messageID,
      );
    }
  }
}
