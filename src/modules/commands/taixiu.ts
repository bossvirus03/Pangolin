import { IPangolinRun } from "src/types/type.pangolin-handle";
import fs from "fs";
import request from "request";

function getImage(number) {
  switch (number) {
    case 1:
      return "https://i.imgur.com/3KH0RVi.png";
    case 2:
      return "https://i.imgur.com/ammclpx.png";
    case 3:
      return "https://i.imgur.com/KETAnfv.png";
    case 4:
      return "https://i.imgur.com/9H62lQ0.png";
    case 5:
      return "https://i.imgur.com/sDq4Vsj.png";
    case 6:
      return "https://i.imgur.com/xxVMZWB.png";
  }
}

export default class TaixiuCommand {
  static config = {
    name: "taixiu",
    category: "GAME",
    version: "1.0.0",
    author: "nguyên blue",
    description: {
      vi: "Game tài xỉu online",
      en: "Online Sic Bo game",
    },
    guide: {
      vi: "[prefix]taixiu",
      en: "[prefix]taixiu",
    },
  };

  constructor(private client) {}

  async run({ api, event, args, UserData }: IPangolinRun) {
    try {
      const { threadID, messageID, senderID } = event;
      const { sendMessage: SEND } = api;

      const dataUser = await UserData.get(senderID);
      const name = dataUser.name || "Unknown";

      const amountToBet = parseInt(args[2]);
      const currentMoney = dataUser.money;

      if (!args[1] || !amountToBet || isNaN(amountToBet)) {
        return SEND(
          "› Bạn chưa nhập [tài/xỉu] [số tiền cược]",
          threadID,
          () => {},
          messageID,
        );
      }

      if (amountToBet < 10000) {
        return SEND(
          "› Bạn cần đặt cược tối thiểu 10,000$",
          threadID,
          () => {},
          messageID,
        );
      }

      if (amountToBet > currentMoney) {
        return SEND(
          "› Bạn không đủ tiền để đặt cược",
          threadID,
          () => {},
          messageID,
        );
      }

      const betType = args[1].toLowerCase();
      const betAmount = args[2] === "allin" ? currentMoney : amountToBet;

      let total = 0;
      const diceResults = [];

      const attachments = [];

      SEND(
        {
          body: `〈 Đang bắt đầu lắc xúc sắc 〉`,
        },
        threadID,
      );

      for (let i = 1; i < 4; i++) {
        const n = Math.floor(Math.random() * 6 + 1);
        diceResults.push(n);
        total += n;
        const img = getImage(n);
        const filePath = `./public/images/${n}.png`;

        await new Promise(() => {
          request(encodeURI(img))
            .pipe(fs.createWriteStream(filePath))
            .on("close", () => {
              attachments.push(fs.createReadStream(filePath));
            });
        });

        await new Promise((resolve) => setTimeout(resolve, 3 * 1000)); // Thời gian delay 3 giây
      }

      const result = total > 10 ? "Tài" : "Xỉu";

      if (
        (betType === "tài" && result === "Tài") ||
        (betType === "xỉu" && result === "Xỉu")
      ) {
        const winnings = betAmount * 2;
        const formattedWinnings = formatMoney(winnings);
        const newMoney = currentMoney + winnings;
        UserData.setMoney(senderID, newMoney);

        SEND(
          {
            body: `〈 Tổng Trận Tài Xỉu 〉\n› Tổng kết: ${result} (${total} điểm)\n› Bạn đã thắng ${formattedWinnings}$.`,
            attachment: attachments,
          },
          threadID,
          () => {},
          messageID,
        );
      } else {
        const formattedBetAmount = formatMoney(betAmount);
        const newMoney = currentMoney - betAmount;
        UserData.setMoney(senderID, newMoney);

        SEND(
          {
            body: `〈 Tổng Trận Tài Xỉu 〉\n› Tổng kết: ${result} (${total} điểm)\n› Bạn đã thua ${formattedBetAmount}$.`,
            attachment: attachments,
          },
          threadID,
          () => {},
          messageID,
        );
      }
    } catch (error) {
      console.error(error);
    }
  }
}

function formatMoney(amount) {
  return amount.toLocaleString();
}
