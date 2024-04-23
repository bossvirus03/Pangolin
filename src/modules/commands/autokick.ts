import fs from "fs";
import { join } from "path";
import {
  IPangolinHandleEvent,
  IPangolinRun,
} from "src/types/type.pangolin-handle";

export default class AutokickCommand {
  static config = {
    category: "GROUP",
    name: "autokick",
    version: "1.0.0",
    author: "Nguyên Blue",
    description: {
      vi: "",
      en: "",
    },
    guide: {
      vi: "",
      en: "",
    },
  };

  static message = {
    vi: {
      text1: "",
      text2: "",
    },
    en: {
      text1: "",
      text2: "",
    },
  };
  constructor(private client) {}

  async handleEvent({ api, event, client }: IPangolinHandleEvent) {
    try {
      const filePath = join(process.cwd(), `/src/db/data/autokick.json`);
      const encoding = "utf8";

      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(
          filePath,
          '{"Trangthai": "on", "tukhoa": [], "userId": {}}',
          "utf-8",
        );
      }

      const fileData = fs.readFileSync(filePath, encoding);
      const jsonData = JSON.parse(fileData);

      if (jsonData.Trangthai === "off") {
        return;
      }

      let inappropriateKeywords = [];
      try {
        inappropriateKeywords = jsonData.tukhoa || [];
      } catch (error) {
        console.error(error);
      }

      if (event && event.body) {
        const { senderID, threadID } = event;
        const messageContent = (event.body as string).toLowerCase();

        for (const keyword of inappropriateKeywords) {
          if (typeof keyword === "string" && messageContent.includes(keyword)) {
            try {
              const userId = senderID.toString();
              const kickCount = jsonData.userId[userId] || 0;
              const threadInfo: any = await new Promise((resolve, reject) => {
                api.getThreadInfo(event.threadID, (err, info) => {
                  if (err) reject(err);
                  else resolve(info);
                });
              });
              const senderInfo = (
                await threadInfo.userInfo.find((info) => info.id === userId)
              ).name;
              if (kickCount >= 3) {
                const result = await api.removeUserFromGroup(userId, threadID);
                if (result.success) {
                  await api.sendMessage(
                    `✅ ${senderInfo} đã bị xóa khỏi nhóm do vi phạm quá nhiều lần.`,
                    threadID,
                  );
                  delete jsonData.userId[userId];
                  fs.writeFileSync(
                    filePath,
                    JSON.stringify(jsonData, null, 2),
                    "utf-8",
                  );
                } else {
                  console.error(
                    `Failed to remove user ${senderInfo} from group ${threadID}`,
                  );
                }
              } else {
                jsonData.userId[userId] = kickCount + 1;
                fs.writeFileSync(
                  filePath,
                  JSON.stringify(jsonData, null, 2),
                  "utf-8",
                );
                await api.sendMessage(
                  `✅ Ghi nhận lỗi vi phạm từ người dùng ${senderInfo}. Số lần vi phạm: ${kickCount + 1}/3`,
                  threadID,
                );
              }
            } catch (error) {
              console.error(error);
            }
            break;
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async run({ api, event, client, args }: IPangolinRun) {
    const { threadID } = event;
    const filePath = join(process.cwd(), `/src/db/data/autokick.json`);

    try {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(
          filePath,
          '{"Trangthai": "on", "tukhoa": [], "userId": {}}',
          "utf-8",
        );
      }

      const fileData = fs.readFileSync(filePath, "utf-8");
      const jsonData = JSON.parse(fileData);

      if (args[1] === "on") {
        jsonData.Trangthai = "on";
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");
        await api.sendMessage(
          `Đã bật tính năng tự động kiểm tra từ cấm.`,
          threadID,
        );
      } else if (args[1] === "off") {
        jsonData.Trangthai = "off";
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");
        await api.sendMessage(
          `Đã tắt tính năng tự động kiểm tra từ cấm.`,
          threadID,
        );
      } else if (args[1] === "list") {
        const bannedWords = jsonData.tukhoa || [];
        const bannedWordsList =
          bannedWords.length > 0
            ? bannedWords
                .map((word, index) => `${index + 1}. ${word}`)
                .join("\n")
            : "Danh sách từ cấm trống.";
        await api.sendMessage(
          `Danh sách từ cấm:\n${bannedWordsList}`,
          threadID,
        );
      } else if (args[1] === "remove") {
        const index = parseInt(args[2]);
        if (!isNaN(index)) {
          const bannedWords = jsonData.tukhoa || [];
          if (index > 0 && index <= bannedWords.length) {
            bannedWords.splice(index - 1, 1);
            jsonData.tukhoa = bannedWords;
            fs.writeFileSync(
              filePath,
              JSON.stringify(jsonData, null, 2),
              "utf-8",
            );
            await api.sendMessage(
              `Đã xóa từ cấm số ${index} thành công.`,
              threadID,
            );
          } else {
            await api.sendMessage(`Số list không hợp lệ.`, threadID);
          }
        } else {
          await api.sendMessage(
            `Vui lòng nhập một số nguyên là số thứ tự của từ cấm cần xóa.`,
            threadID,
          );
        }
      } else if (args[1] === "removeall") {
        jsonData.tukhoa = [];
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");
        await api.sendMessage(
          `Đã xóa tất cả từ cấm trong danh sách.`,
          threadID,
        );
      } else if (args[1] === "add") {
        const newKeyword = args.slice(2).join(" ").toLowerCase();
        if (newKeyword) {
          const bannedWords = jsonData.tukhoa || [];
          bannedWords.push(newKeyword);
          jsonData.tukhoa = bannedWords;
          fs.writeFileSync(
            filePath,
            JSON.stringify(jsonData, null, 2),
            "utf-8",
          );
          await api.sendMessage(
            `Đã thêm từ cấm "${newKeyword}" vào danh sách.`,
            threadID,
          );
        } else {
          await api.sendMessage(
            `Vui lòng nhập từ khóa cấm cần thêm.`,
            threadID,
          );
        }
      } else {
        await api.sendMessage(
          "Lệnh không hợp lệ. Vui lòng sử dụng 'autokick on', 'autokick off', 'autokick list', 'autokick remove [số list cần xóa]', 'autokick removeall' hoặc 'autokick add [từ khóa cấm]'.",
          threadID,
        );
      }
    } catch (error) {
      console.error(error);
      await api.sendMessage("Đã xảy ra lỗi khi thực hiện yêu cầu.", threadID);
    }
  }
}
