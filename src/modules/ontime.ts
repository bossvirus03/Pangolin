import Ifca from "src/types/type.api";
import * as cron from "node-cron";

/*
38 16 * * *
    Trong đó:
        38 là phần phút (38 phút)
        16 là phần giờ (16 giờ)

see https://www.npmjs.com/package/cron
*/
class OnTime {
  scheduleTask(api: Ifca) {
    api.listenMqtt(async (err, event) => {
      cron.schedule("38 16 * * *", () => {
        console.log("Chạy công việc vào lúc 16:38 giờ hàng ngày");
        api.sendMessage(
          "Chạy công việc vào lúc 16:38 giờ hàng ngày",
          event.threadID
        );
      });
    });
  }
}
export default OnTime;
