import { join } from "path";
import * as fs from "fs";
import * as cache from "memory-cache";
export default class RuleCommand {
  static config = {
    name: "rule",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description:
      "Cách dùng: [prefix]rule [add/remove]\nChức năng: xem, thêm, xoá các luật lệ của nhóm",
  };

  constructor(private client) {}
  pathDataRule = join(process.cwd(), "/src/database/data/rule.json");

  async handleRemoveRule(ruleIndex: number, event, api) {
    const previousRule = fs.readFileSync(this.pathDataRule, "utf8");
    const previousRuleArray = JSON.parse(previousRule);
    console.log(ruleIndex);
    for (let dataRule of previousRuleArray) {
      if (dataRule.threadID == event.threadID) {
        if (dataRule.rules.length < ruleIndex) {
          return api.sendMessage("Rule không tồn tại", event.threadID);
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
          }
        );
        api.sendMessage(
          `Đã xóa thành công rule ${ruleIndex}!!`,
          event.threadID
        );
      }
    }
  }

  async handleAddRule(rule, event, api) {
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
    api.sendMessage(`Đã thêm thành công rule: ${rule}`, event.threadID);
  }
  async event(api, event, client) {
    if (event.type === "message_reply") {
      if (event.messageReply.messageID == cache.get("tmp-rule-message")) {
        if (event.body.startsWith("remove")) {
          const index = event.body.split("remove")[1].trim();
          if (!/^\d+(\.\d+)?$/.test(index)) {
            return api.sendMessage("Rule phải là số!", event.threadID);
          }
          this.handleRemoveRule(index, event, api);
        }
        if (event.body.startsWith("add")) {
          const rule: string = event.body.split("add")[1].trim();
          this.handleAddRule(rule, event, api);
        }
      }
    }
  }
  async run(api, event, client, args) {
    if (args[1] === "add") {
      const rule = event.body.split(args[1])[1].trim();
      if (!rule) return api.sendMessage("Vui lòng viết rule!", event.threadID);
      this.handleAddRule(rule, event, api);
    }
    if (args[1] === "remove") {
      if (!args[2])
        return api.sendMessage("Bạn cần nhập index của rule!", event.threadID);
      console.log(!/^\d+(\.\d+)?$/.test(args[2]));
      if (!/^\d+(\.\d+)?$/.test(args[2])) {
        return api.sendMessage("Rule phải là số!", event.threadID);
      } else {
        if (args[2] == 0) {
          return api.sendMessage("Rule phải lớn hơn 0!", event.threadID);
        } else {
          try {
            await this.handleRemoveRule(args[2], event, api);
          } catch (error) {
            console.log(error);
          }
        }
      }
    } else {
      const previousWarn = fs.readFileSync(this.pathDataRule, "utf8");
      const previousWarnArray = JSON.parse(previousWarn);
      const ruleOfThread = previousWarnArray.filter(
        (item) => item.threadID === event.threadID
      );
      const name = await new Promise((resolve, reject) => {
        api.getThreadInfo(event.threadID, (err, info) => {
          if (err) return reject(err);
          else resolve(info.name);
        });
      });
      let smg = `--------${name}--------\nDanh sách các rules trong nhóm:\n`;

      ruleOfThread[0].rules.forEach((item, index) => {
        smg += `  ${++index}. ${item}\n`;
      });
      smg +=
        "\nreply add [rule] để thêm rule hoặc remove [rule index] để xoá rule";
      api.sendMessage(smg, event.threadID, (err, message) => {
        cache.put("tmp-rule-message", message.messageID, 1000 * 5 * 60);
      });
    }
  }
}
