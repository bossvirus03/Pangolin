import { IPangolinRun } from "src/types/type.pangolin-handle";
import { IUserInThreadData } from "src/types/type.userInThreadData";

export default class MoneyCommand {
  static config = {
    name: "money",
    category: "PAYMENT",
    version: "1.0.0",
    author: "Nguyên Blue",
    description: {
      vi: "check | add | del | top - money",
      en: "check | add | del | top - money",
    },
    guide: {
      vi: "[prefix]money",
      en: "[prefix]money",
    },
  };

  static message = {
    vi: {
      using:
        "〈 HDSD 〉\n#Money add [amount] | để set tiền cho bản thân hoặc người khác.\n#Money del [amount] | để trừ tiền của bản thân hoặc người khác\n#Money check | xem số tiền của bản thân hoặc người khác.\n#Money top | xem top 10 tỷ phú.",
      needAdmin: "Bạn cần là admin để sử dụng lệnh này!",
      invalidMoney: "Số tiền không hợp lệ, vui lòng nhập lại.",
      invalidDel: "Số tiền cần trừ lớn hơn số tiền hiện có.",
      added: `Đã thêm 〈 $0 $ 〉 cho người dùng $0`,
      minus: `Đã trừ 〈 $0 $ 〉 của người dùng $1`,
      check: `Số tiền của người dùng $0 là 〈 $1 $ 〉`,
      top: "[ TOP 10 TỶ PHÚ ]\n $0",
    },
    en: {
      using:
        "〈 User manual 〉\n#Money add [amount] | to set money for yourself or someone else.\n#Money del [amount] | to deduct money from yourself or someone else\n#Money check | see the amount of yourself or others.\n#Money top |. see top 10 billionaires.",
      needAdmin: "You need to be an admin to use this command!",
      invalidMoney: "Invalid amount, please re-enter.",
      invalidDel:
        "The amount to be deducted is greater than the available amount.",
      added: `Đã thêm 〈 $0 $ 〉 cho người dùng $1`,
      minus: `Subtracted 〈 $0 $ 〉 from user $1`,
      check: `User $0's amount is 〈 $1 $ 〉`,
      top: `Top 10 users with the highest amount:\n`,
    },
  };

  constructor(private client) {}

  async run({ api, event, getLang, args, UserData, pangolin }: IPangolinRun) {
    const { senderID, mentions, type, threadID } = event;
    const msg =
      Object.keys(mentions).length == 0
        ? type == "message_reply"
          ? event.messageReply.senderID
          : senderID
        : Object.entries(mentions)
            .map((e) => `${(e[1] as string).replace(/@/g, "")} - ${e[0]}`)
            .join("\n");

    const dataUser = await UserData.get(msg);
    const name = dataUser.name;

    if (args.length === 1) {
      api.sendMessage(getLang("using"), threadID);
    } else if (args[1] === "add" && args.length === 3) {
      if (!pangolin.admins.includes(senderID)) {
        return api.sendMessage(getLang("needAdmin"), threadID);
      }
      const amount = parseInt(args[2]);
      if (isNaN(amount)) {
        return api.sendMessage(getLang("invalidMoney"), threadID);
      }
      const formattedAmount = amount.toLocaleString();
      const newMoney = dataUser.money + amount;
      UserData.setMoney(msg, newMoney);
      api.sendMessage(getLang("added", formattedAmount, name), threadID);
    } else if (args[1] === "del" && args.length === 3) {
      const amountToSubtract = parseInt(args[2]);
      if (isNaN(amountToSubtract)) {
        return api.sendMessage(getLang("invalidMoney"), threadID);
      }
      const currentMoney = dataUser.money;
      if (currentMoney < amountToSubtract) {
        return api.sendMessage(getLang("invalidDel"), threadID);
      }
      const formattedAmountToSubtract = amountToSubtract.toLocaleString();
      const newAmount = currentMoney - amountToSubtract;
      UserData.setMoney(msg, newAmount);
      api.sendMessage(
        getLang("minus", formattedAmountToSubtract, name),
        threadID,
      );
    } else if (args[1] === "check" && args.length === 2) {
      const ismoney = dataUser.money;
      const formattedMoney = ismoney.toLocaleString();
      api.sendMessage(getLang("check", name, formattedMoney), threadID);
    } else if (args[1] === "top" && args.length === 2) {
      const users = await UserData.getAll();
      const smg = await Promise.all(
        users.map(async (user) => {
          return { name: user.name, money: user.money };
        }),
      );
      smg.sort((a, b) => b.money - a.money);
      const top10 = smg.slice(0, 10);
      let smgSorted = "";
      top10.forEach((user, index) => {
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
          smgSorted += `${medal} ${user.name} - ${user.money} $\n`;
        }
      });
      api.sendMessage(getLang("top", smgSorted), threadID);
    }
  }
}
