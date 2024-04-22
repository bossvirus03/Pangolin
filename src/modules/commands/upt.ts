import * as os from "os";
import moment from "moment-timezone";
import fs from "fs";
import * as nodeDiskInfo from "node-disk-info";
import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class UptCommand {
  static config = {
    category: "ADMIN",
    name: "upt",
    version: "1.0.0",
    author: "Nguyên Blue [convert] - nguồn niiozic team",
    permission: 2,
    description: {
      vi: "Hiển thị thông tin hệ thống bot",
      en: "Show bot system information",
    },
    guide: {
      vi: "[prefix]upt",
      en: "[prefix]upt",
    },
  };

  static message = {
    vi: {
      info: `⏰ Bây giờ là: $0 | $1
      ⏱️ Thời gian đã hoạt động: $2:$3:$4
      📝 Dấu lệnh: $5
      🗂️ Số lượng package: $6
      🔣 Tình trạng bot: $7
      📋 Hệ điều hành: $8 $9 ($10)
      💾 CPU: $11 core(s) - $12 @ $13MHz
      📊 RAM: $14GB/$15GB (đã dùng)
      🛢️ Ram trống: $16GB
      🗄️ Storage: $17/$18 (đã dùng)
      📑 Storage trống: $19
      🛜 Ping: $20ms
      👤 Yêu cầu bởi: $21
        `.trim(),
    },
    en: {
      info: `
      ⏰ Now: $0 | $1
      ⏱️ Operating time: $2:$3:$4
      📝 Order mark: $5
      🗂️ Package quantity: $6
      🔣 Bot status: $7
      📋 Operating system: $8 $9 ($10)
      💾 CPU: $11 core(s) - $12 @ $13MHz
      📊 RAM: $14GB/$15GB (used)
      🛢️ Empty RAM: $16GB
      🗄️ Storage: $17/$18 (used)
      📑 Empty storage: $19
      🛜 Ping: $20ms
      👤 Requested by: $21
        `.trim(),
    },
  };
  constructor(private client) {}
  async run({ api, event, pangolin, getLang }: IPangolinRun) {
    const ping = Date.now();
    async function getDependencyCount() {
      try {
        await fs.promises.access("package.json");
        const packageJsonString = await fs.promises.readFile(
          "package.json",
          "utf-8",
        );
        const packageJson = JSON.parse(packageJsonString);

        if (!packageJson || typeof packageJson !== "object") {
          throw new Error("Invalid package.json content.");
        }

        const depCount = Object.keys(packageJson.dependencies || {}).length;
        const devDepCount = Object.keys(
          packageJson.devDependencies || {},
        ).length;

        return { depCount, devDepCount };
      } catch (error) {
        console.error("Error:", error.message);
        return { depCount: -1, devDepCount: -1 };
      }
    }
    function getStatusByPing(pingReal) {
      if (pingReal < 200) {
        return "mượt";
      } else if (pingReal < 800) {
        return "trung bình";
      } else {
        return "mượt";
      }
    }
    function getPrimaryIP() {
      const interfaces = os.networkInterfaces();
      for (let iface of Object.values(interfaces)) {
        for (let alias of iface) {
          if (alias.family === "IPv4" && !alias.internal) {
            return alias.address;
          }
        }
      }
      return "127.0.0.1";
    }
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / (60 * 60));
    const uptimeMinutes = Math.floor((uptime % (60 * 60)) / 60);
    const uptimeSeconds = Math.floor(uptime % 60);
    const threadInfo: any = await new Promise((resolve, reject) => {
      api.getThreadInfo(event.threadID, (err, info) => {
        if (err) reject(err);
        else resolve(info);
      });
    });
    const senderInfo = (
      await threadInfo.userInfo.find((info) => info.id === event.senderID)
    ).name;
    const { depCount, devDepCount } = await getDependencyCount();
    const botStatus = getStatusByPing(ping);
    const primaryIp = getPrimaryIP();
    try {
      const disks = await nodeDiskInfo.getDiskInfo();
      const firstDisk: any = disks[0] || {};
      //   const usedSpace = firstDisk.blocks - firstDisk.available;
      function convertToGB(bytes) {
        if (bytes === undefined) return "N/A";
        const GB = bytes / (1024 * 1024 * 1024);
        return GB.toFixed(2) + "GB";
      }
      const pingReal = Date.now() - ping;
      const replyMsg = getLang(
        "info",
        moment().tz("Asia/Ho_Chi_Minh").format("HH:mm:ss"),
        moment().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY"),
        uptimeHours.toString().padStart(2, "0"),
        uptimeMinutes.toString().padStart(2, "0"),
        uptimeSeconds.toString().padStart(2, "0"),
        pangolin.prefix,
        depCount >= 0 ? depCount : "Không xác định",
        botStatus,
        os.type(),
        os.release(),
        os.arch(),
        os.cpus().length,
        os.cpus()[0].model,
        Math.round(os.cpus()[0].speed),
        (usedMemory / 1024 / 1024 / 1024).toFixed(2),
        (totalMemory / 1024 / 1024 / 1024).toFixed(2),
        (freeMemory / 1024 / 1024 / 1024).toFixed(2),
        convertToGB(firstDisk.used),
        convertToGB(firstDisk.blocks),
        convertToGB(firstDisk.available),
        pingReal,
        senderInfo,
      );

      api.sendMessage(replyMsg, event.threadID, () => {}, event.messageID);
    } catch (error) {
      console.error("❎ Error getting disk information:", error.message);
    }
  }
}
