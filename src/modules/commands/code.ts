import axios from "axios";
import fs from "fs";
import { join } from "path";
import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class LamNetCommand {
  static config = {
    name: "code",
    version: "1.0..0",
    author: "Nguyên Blue",
    category: "ADMIN",
    permission: 2,
    description: {
      vi: "Chỉnh sửa file command",
      en: "Edit command file",
    },
    guide: {
      vi: "[prefix]code",
      en: "[prefix]code",
    },
  };

  constructor(private client) {}

  static message = {
    vi: {
      using: `
      Cách Sử Dụng:
      - Để chỉnh sửa một tệp: \`!code edit <tên_tệp> <mã_mới>\`
      - Để đọc một tệp: \`!code read <tên_tệp>\`
      - Để tạo một tệp: \`!code cre <tên_tệp>\`
      - Để xóa một tệp: \`!code del <tên_tệp>\`
      - Để đổi tên một tệp: \`!code rename <tên_cũ> <tên_mới>\`
    `,
      errChange: `Đã xảy ra lỗi khi chỉnh sửa file "$0.ts".`,
      created: `Đã tạo file "$0.ts" thành công.`,
      deleted: `Đã xóa file "$0.ts" thành công.`,
      renamed: `Đã đổi tên file "$0.ts" thành "$1.ts" thành công.`,
      readError: `Đã xảy ra lỗi khi đọc file "$0.ts".`,
      nameEmpty: "Chưa đặt tên cho modules",
    },
    en: {
      using: `
      Using:
      - To edit a file: \`!code edit <filename> <new_code>\`
      - To read a file: \`!code read <file_name>\`
      - To create a file: \`!code cre <file_name>\`
      - To delete a file: \`!code del <file_name>\`
      - To rename a file: \`!code rename <old_name> <new_name>\`
    `,
      errChange: `An error occurred while editing file "$0.ts".`,
      changed: `Đã chỉnh sửa file "$0.ts" thành công.`,
      created: `File "$0.ts" created successfully.`,
      deleted: `Successfully deleted file "$0.ts".`,
      renamed: `Successfully renamed file "$0.ts" to "$1.ts".`,
      readError: `An error occurred while reading file "$0.ts".`,
      nameEmpty: "No module name yet",
    },
  };

  async run({ api, event, getLang, args }: IPangolinRun) {
    if (args.length === 1) {
      const huongDanSuDung = getLang("using");
      return api.sendMessage(huongDanSuDung, event.threadID);
    }
    const path = join(process.cwd(), `/src/modules/commands`);
    if (args[1] == "edit") {
      var newCode = (event.body as string).slice(
        8 + args[2].length + args[1].length,
        (event.body as string).length,
      );
      fs.writeFile(`${path}/${args[2]}.ts`, newCode, "utf-8", function (err) {
        if (err)
          return api.sendMessage(
            getLang("errChange", args[2]),
            event.threadID,
            () => {},
            event.messageID,
          );
        api.sendMessage(
          getLang("changed", args[2]),
          event.threadID,
          () => {},
          event.messageID,
        );
      });
    } else if (args[1] == "read" || args[1] == "-r") {
      var data = await fs.readFile(
        `${path}/${args[2]}.ts`,
        "utf-8",
        (err, data) => {
          if (err)
            return api.sendMessage(
              getLang("readError", args[2]),
              event.threadID,
              () => {},
              event.messageID,
            );
          api.sendMessage(data, event.threadID, () => {}, event.messageID);
        },
      );
    } else if (args[1] == "cre") {
      if (args[2].length == 0)
        return api.sendMessage(getLang("nameEmpty"), event.threadID);
      if (fs.existsSync(`${path}/${args[2]}.ts`))
        return api.sendMessage(
          `${args[2]}.ts đã tồn tại.`,
          event.threadID,
          () => {},
          event.messageID,
        );
      fs.copyFileSync(path + "/ping.ts", path + "/" + args[2] + ".ts");
      return api.sendMessage(
        getLang("created", args[2]),
        event.threadID,
        () => {},
        event.messageID,
      );
    } else if (args[1] == "del") {
      fs.unlinkSync(`${path}/${args[2]}.ts`);
      return api.sendMessage(
        getLang("deleted", args[2]),
        event.threadID,
        () => {},
        event.messageID,
      );
    } else if (args[1] == "rename") {
      fs.rename(
        `${path}/${args[2]}.ts`,
        `${path}/${args[3]}.ts`,
        function (err) {
          if (err) throw err;
          return api.sendMessage(
            getLang("renamed", args[2], args[3]),
            event.threadID,
            () => {},
            event.messageID,
          );
        },
      );
    }
  }
}
