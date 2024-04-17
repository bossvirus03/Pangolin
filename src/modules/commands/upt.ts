import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import * as os from "os";
import moment from "moment-timezone";
import fs from "fs";
import * as nodeDiskInfo from "node-disk-info";

export default class UptCommand {
  static config = {
    name: "upt",
    version: "1.0.0",
    author: "Nguyên Blue [convert] - nguồn niiozic team",
    createdAt: "",
    description: "Hiển thị thông tin hệ thống bot",
  };

  constructor(private client) {}
  async run(api: Ifca, event: IEvent, client, args) {
    const ping = Date.now();
    async function getDependencyCount() {
      try {
        await fs.promises.access("package.json");
        const packageJsonString = await fs.promises.readFile(
          "package.json",
          "utf-8"
        );
        const packageJson = JSON.parse(packageJsonString);

        if (!packageJson || typeof packageJson !== "object") {
          throw new Error("Invalid package.json content.");
        }

        const depCount = Object.keys(packageJson.dependencies || {}).length;
        const devDepCount = Object.keys(
          packageJson.devDependencies || {}
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
      const replyMsg =
        `⏰ Bây giờ là: ${moment().tz("Asia/Ho_Chi_Minh").format("HH:mm:ss")} | ${moment().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY")}
⏱️ Thời gian đã hoạt động: ${uptimeHours.toString().padStart(2, "0")}:${uptimeMinutes.toString().padStart(2, "0")}:${uptimeSeconds.toString().padStart(2, "0")}
📝 Dấu lệnh mặc định: ${process.env.PREFIX}
🗂️ Số lượng package: ${depCount >= 0 ? depCount : "Không xác định"}
🔣 Tình trạng bot: ${botStatus}
📋 Hệ điều hành: ${os.type()} ${os.release()} (${os.arch()})
💾 CPU: ${os.cpus().length} core(s) - ${os.cpus()[0].model} @ ${Math.round(os.cpus()[0].speed)}MHz
📊 RAM: ${(usedMemory / 1024 / 1024 / 1024).toFixed(2)}GB/${(totalMemory / 1024 / 1024 / 1024).toFixed(2)}GB (đã dùng)
🛢️ Ram trống: ${(freeMemory / 1024 / 1024 / 1024).toFixed(2)}GB
🗄️ Storage: ${convertToGB(firstDisk.used)}/${convertToGB(firstDisk.blocks)} (đã dùng)
📑 Storage trống: ${convertToGB(firstDisk.available)}
🛜 Ping: ${pingReal}ms
👤 Yêu cầu bởi: ${senderInfo}
  `.trim();
      api.sendMessage(replyMsg, event.threadID, () => {}, event.messageID);
    } catch (error) {
      console.error("❎ Error getting disk information:", error.message);
    }
  }
}
