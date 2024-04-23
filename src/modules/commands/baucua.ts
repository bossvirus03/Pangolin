import { IPangolinRun } from "src/types/type.pangolin-handle";
import fs from "fs";
import request from "request";

const imageUrls = {
  bầu: "https://i.imgur.com/1MZ2RUz.jpg",
  tôm: "https://i.imgur.com/8nTJyNK.jpg",
  cua: "https://i.imgur.com/OrzfTwg.jpg",
  cá: "https://i.imgur.com/EOH26Am.jpg",
  gà: "https://i.imgur.com/uV4eyKs.jpg",
  nai: "https://i.imgur.com/sPP6Glh.jpg",
};

export default class BauCuaCommand {
  static config = {
    category: "GAME",
    name: "baucua",
    version: "1.0.0",
    author: "nguyên blue",
    description: {
      vi: "game bầu cua online",
      en: "",
    },
    guide: {
      vi: "[prefix]baucua",
      en: "[prefix]baucua",
    },
  };

  static message = {
    vi: {
      win: "〈 Kết quả lắc bầu cua 〉\n› Đã lắc ra: $0\n› Số tiền thắng: $1$.",
      lost: "〈 Kết quả lắc bầu cua 〉\n› Đã lắc ra: $0\n› Số tiền thua: $1$.",
      wait: "〈 Đang lắc bầu cua 〉",
      isEmpty: "› Bạn chưa nhập [tên con vật] [số tiền cược]",
      min: "› Bạn cần đặt cược tối thiểu 10,000$",
      notEnough: "› Bạn không đủ tiền để đặt cược",
    },
    en: {
      win: "〈 Result of shaking crab gourd 〉\n› Shaken out: $0\n› Winning amount: $1$.",
      lost: "〈 Crab gourd shaking results 〉\n› Shaken out: $0\n› Loss amount: $1$.",
      wait: "〈 Shaking crab gourd 〉",
      isEmpty: "› You have not entered [animal name] [bet amount]",
      min: "› You need to bet at least $10,000",
      notEnough: "› You don't have enough money to bet",
    },
  };
  constructor(private client) {}

  async run({ api, event, args, UserData, getLang }: IPangolinRun) {
    try {
      const { threadID, messageID, senderID } = event;
      const { sendMessage: SEND } = api;

      const dataUser = await UserData.get(senderID);
      const name = dataUser.name || "Unknown";

      const amountToBet = parseInt(args[2]);
      const currentMoney = dataUser.money;

      if (!args[1] || !amountToBet || isNaN(amountToBet)) {
        return SEND(getLang("isEmpty"), threadID, () => {}, messageID);
      }

      if (amountToBet < 10000) {
        return SEND(getLang("min"), threadID, () => {}, messageID);
      }

      if (amountToBet > currentMoney) {
        return SEND(getLang("notEnough"), threadID, () => {}, messageID);
      }

      const selectedAnimal = args[1].toLowerCase();
      const betAmount = args[2] === "allin" ? currentMoney : amountToBet;

      let total = 0;
      const animalResults = [];

      const attachments = [];

      SEND(
        {
          body: getLang("wait"),
        },
        threadID,
      );

      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * 6);
        const animal = Object.keys(imageUrls)[randomIndex];
        animalResults.push(animal);
        const imgUrl = imageUrls[animal];
        const filePath = `./public/images/${animal}.png`;

        await new Promise(() => {
          request(encodeURI(imgUrl))
            .pipe(fs.createWriteStream(filePath))
            .on("close", () => {
              attachments.push(fs.createReadStream(filePath));
            });
        });

        await new Promise((resolve) => setTimeout(resolve, 3 * 1000));
      }

      const selectedAnimalInResults = animalResults.filter(
        (animal) => animal === selectedAnimal,
      ).length;
      let winnings = 0;
      if (selectedAnimalInResults > 0) {
        winnings = betAmount * 2;
        const formattedWinnings = formatMoney(winnings);
        const newMoney = currentMoney + winnings;
        UserData.setMoney(senderID, newMoney);
        SEND(
          {
            body: getLang("win", animalResults.join(", "), formattedWinnings),
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
            body: getLang("lost", animalResults.join(", "), formattedBetAmount),
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
