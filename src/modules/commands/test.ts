import * as cache from "memory-cache";
import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import { IUserInThreadData } from "src/types/type.userInThreadData";

export default class CheckttCommand {
  static config = {
    name: "test",
    version: "1.0.0",
    author: "Nguyên Blue | Lợi",
    createdAt: "",
    permission: 1,
    description: {
      vi: "Kiểm tra số lượt thành viên tương tác của bạn trong nhóm",
      en: "Check the number of your interactions in the group",
    },
    guide: {
      vi: "[prefix]check",
      en: "[prefix]check",
    },
  };

  static message = {
    vi: {
      listInteract: "$0",
    },
    en: {
      listInteract: "$0",
    },
  };

  constructor(private client) {}

  async run(
    api: Ifca,
    event: IEvent,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData: IUserInThreadData,
    getLang
  ) {
    // const puppeteer = require("puppeteer");

    // (async () => {
    //   const browser = await puppeteer.launch({
    //     headless: true, // Chạy trong chế độ headless
    //     args: ["--no-sandbox", "--disable-setuid-sandbox"], // Cần thiết khi chạy trên máy chủ Linux
    //   });
    //   const page = await browser.newPage();
    //   await page.goto("https://www.example.com");
    //   console.log(await page.title());
    //   await browser.close();
    // })();

    if (!args[1]) {
      const huongDanSuDung = `
        Cách Sử Dụng:
        - Để chỉnh sửa một tệp: \`!code edit <tên_tệp> <mã_mới>\`
        - Để đọc một tệp: \`!code read <tên_tệp>\`
        - Để tạo một tệp: \`!code cre <tên_tệp>\`
        - Để xóa một tệp: \`!code del <tên_tệp>\`
        - Để đổi tên một tệp: \`!code rename <tên_cũ> <tên_mới>\`
      `;
      return api.sendMessage(huongDanSuDung, event.threadID);
    }
  }
}
