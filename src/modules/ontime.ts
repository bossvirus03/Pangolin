import Ifca from "src/types/type.api";
import * as cron from "node-cron";
import { Thread } from "src/db/models/threadModel";
import { UserInThread } from "src/db/models/userInThreadModel";
import { User } from "src/db/models/userModel";
class OnTime {
  async scheduleTask(api: Ifca) {
    const threadData = await Thread.findAll();
    const userData = await User.findAll();
    const userInThreadData = await UserInThread.findAll();

    // Automatically send a message at 05:00
    cron.schedule("00 05 * * *", async () => {
      threadData.map((item) => {
        api.sendMessage("[Automation] Buổi sáng vui vẻ", item.dataValues.tid);
      });
    });
  }
}

export default OnTime;
