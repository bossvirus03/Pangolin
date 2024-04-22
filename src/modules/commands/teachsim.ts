import { join } from "path";
import * as sqlite3 from "sqlite3";

import { IPangolinRun } from "src/types/type.pangolin-handle";
sqlite3.verbose();

export default class SimCommand {
  static config = {
    category: "GROUP",
    name: "teachsim",
    version: "1.0.0",
    author: "Lợi",
    guide: {
      vi: "[prefix]teachsim (câu hỏi | câu trả lời)",
      en: "[prefix]teachsim (question | answer)",
    },
    description: {
      vi: "Dạy simsimi",
      en: "teach simsimi",
    },
  };

  static message = {
    vi: {
      syntaxError:
        "Vui lòng nhập câu hỏi và câu trả lời theo định dạng: câu hỏi | câu trả lời",
      info: "Đã dạy sim thành công",
    },
    en: {
      syntaxError:
        "Please enter questions and answers in the format: question | answer",
      info: "Successfully taught sim",
    },
  };
  async run({ api, event, args, getLang }: IPangolinRun) {
    const body = (event.body as string).split(args[0])[1].split("|");
    if (!body[0] || !body[1]) {
      return api.sendMessage(getLang("syntaxError"), event.threadID);
    }
    const [question, reply] = [body[0].trim(), body[1].trim()];
    const db = new sqlite3.Database(
      join(process.cwd(), "src/db/data/simsimi.sqlite"),
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) {
          console.error(err.message);
        }
      },
    );
    let sql = `INSERT INTO Sim (CauHoi, TraLoi, TheLoai, ThoiGian) 
    VALUES (\'${question}\', \'${reply}\', '', '');`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
    });
    api.sendMessage(getLang("info"), event.threadID);
  }
}
