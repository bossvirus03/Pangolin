import Ifca from "src/types/type.api";
import * as cron from "node-cron";
import { join } from "path";
import fs from "fs";
import { Thread } from "./../db/models/threadModel";
import { UserInThread } from "./../db/models/userInThreadModel";
import { User } from "./../db/models/userModel";
class OnTime {
  async scheduleTask(api: Ifca) {
    const threadData = await Thread.findAll();
    const userData = await User.findAll();
    const userInThreadData = await UserInThread.findAll();
    // Đường dẫn tới các thư mục cache
    const paths = [
      join(process.cwd(), `/public/videos/`),
      join(process.cwd(), `/public/images/`),
      join(process.cwd(), `/public/files/`),
      join(process.cwd(), `/public/audios/`),
    ];

    // Automatically send a message at 05:00
    cron.schedule("00 05 * * *", async () => {
      threadData.map((item) => {
        api.sendMessage("[Automation] Buổi sáng vui vẻ", item.dataValues.tid);
      });
    });

    // Automatically send a message at 10:00
    cron.schedule("00 16 * * *", async () => {
      threadData.map((item) => {
        api.sendMessage("[Automation] Buổi chiều vui vẻ", item.dataValues.tid);
      });
    });

    // Lên lịch xóa cache mỗi 12 giờ đêm
    cron.schedule("15 13 * * *", async () => {
      try {
        paths.forEach((path) => {
          fs.readdir(path, (err, files) => {
            if (err) {
              console.error("Lỗi khi đọc thư mục cache:", err);
              return;
            }
            const cacheFiles = files.filter((file) => {
              return /\.(png|jpg|jpeg|gif|mp4|avi|mp3|wav|txt|pdf)$/i.test(
                file,
              );
            });
            cacheFiles.forEach((file) => {
              fs.unlinkSync(join(path, file));
              console.log(`Đã xóa tệp cache: ${file}`);
            });
          });
        });
      } catch (error) {
        console.error("Lỗi khi xóa cache:", error);
      }
    });
  }
}

export default OnTime;
