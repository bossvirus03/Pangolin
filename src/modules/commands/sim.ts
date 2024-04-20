import * as cache from "memory-cache";
import { join } from "path";
import * as sqlite3 from "sqlite3";

import { IPangolinRun } from "src/types/type.pangolin-handle";
sqlite3.verbose();
import * as stringSimilarity from "string-similarity";

export default class SimCommand {
  static config = {
    category: "GROUP",
    name: "sim",
    version: "1.0.0",
    author: "Lợi",

    description:
      "Cách dùng: [prefix]Sim on/off\nChức năng: Trò chuyện cùng với simsimi",
  };

  constructor(private client) {}

  async run({ api, event, client, args, UserData, ThreadData }) {
    if (args[1] == "on") {
      cache.put("simsimi", event.threadID, 15 * 1000 * 60);
      api.sendMessage("Đã bật simsimi", event.threadID);
    }
    if (args[1] == "off") {
      cache.del("simsimi");
      api.sendMessage("Đã tắt simsimi", event.threadID);
    }
  }
  async event({
    api,
    event,
    client,
    args,
    UserData,
    ThreadData,
  }: IPangolinRun) {
    const db = new sqlite3.Database(
      join(process.cwd(), "src/db/data/simsimi.sqlite"),
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) {
          console.error(err.message);
        }
      },
    );

    if (
      event.type == "message" &&
      cache.get("simsimi") == event.threadID &&
      event.threadID != null
    ) {
      // Query để lấy dữ liệu từ bảng văn bản trong SQLite
      let sql = `SELECT id, CauHoi, TraLoi FROM Sim`;
      db.all(sql, [], (err, rows) => {
        if (err) {
          throw err;
        }
        const query = event.body;

        // Tìm văn bản gần đúng nhất trong cơ sở dữ liệu
        let maxSimilarity = -1;
        let mostSimilarDocument = null;
        let mostSimiResult = null;
        let response = true;
        rows.forEach((row: any) => {
          const similarity = stringSimilarity.compareTwoStrings(
            query,
            row.CauHoi,
          );
          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            mostSimilarDocument = row.id;
            mostSimiResult = row.TraLoi;
            if (similarity == 0) {
              response = false;
            }
          }
        });
        if (!response) {
          return api.sendMessage(
            "Hông hiểu gì hết trơn á",
            event.threadID,
            () => {},
            event.messageID,
          );
        }
        api.sendMessage(mostSimiResult, event.threadID);
      });
    }
  }
}
