import { join } from "path";
import * as sqlite3 from "sqlite3";
import * as cache from "memory-cache";
import * as fs from "fs";
import axios from "axios";
import {
  IPangolinHandleEvent,
  IPangolinRun,
} from "src/types/type.pangolin-handle";
sqlite3.verbose();

export default class ReportCommand {
  static config = {
    category: "GROUP",
    name: "report",
    version: "1.0.0",
    author: "Lợi",
    permission: 1,
    description: {
      vi: "Báo cáo đến admin bot",
      en: "Report to admin bot",
    },
    guide: {
      vi: "[prefix]report",
      en: "[prefix]report",
    },
  };

  static message = {
    vi: {
      reportFromUser:
        "-------[report]-------\nname: $0\nurl: $1\n\nmessage: $2\n",
      adminResponse: "-------[Phản hồi của AD]-------\n$0",
    },
    en: {
      reportFromUser:
        "-------[report]-------\nname: $0\nurl: $1\n\nmessage: $2\n",
      adminResponse: "-------[Admin response]-------\n$0",
    },
  };

  constructor(private client) {}

  async run({ api, event, client, args, pangolin, getLang }: IPangolinRun) {
    const attachments = event?.messageReply?.attachments;
    const listAds = pangolin.admins;
    const listAttachment = [];
    const info: any = await new Promise((resolve, reject) => {
      api.getUserInfo(event.senderID, (err, info) => {
        if (err) return reject(err);
        else {
          resolve(info[event.senderID]);
        }
      });
    });
    if (attachments) {
      const promises = attachments.map(async (item, index) => {
        const path = join(
          process.cwd(),
          `/public/images/${index}_sendAd_${event.senderID}.jpg`,
        );
        try {
          const response = await axios.get(item.url, {
            responseType: "arraybuffer",
          });
          const buffer = Buffer.from(response.data);
          fs.writeFileSync(path, buffer);
          listAttachment.push(fs.createReadStream(path));
        } catch (error) {
          console.error("Error downloading image:", error);
          return null;
        }
      });

      Promise.all(promises).then(async () => {
        listAds.map((id) => {
          api.sendMessage(
            {
              body: getLang(
                "reportFromUser",
                info.name,
                info.profileUrl,
                (event.body as string).split(args[0])[1].trim(),
              ),
              attachment: listAttachment,
            },
            id,
            (err, info) => {
              if (err) console.log(err);
              cache.put("report", {
                senderID: event.senderID,
                threadID: event.threadID,
                messageID: info.messageID,
              });
            },
          );
        });
      });
    } else {
      listAds.map((id) => {
        api.sendMessage(
          {
            body: getLang(
              "reportFromUser",
              info.name,
              info.profileUrl,
              (event.body as string).split(args[0])[1].trim(),
            ),
          },
          id,
          (err, info) => {
            if (err) console.log(err);
            cache.put(
              "report",
              {
                senderID: event.senderID,
                threadID: event.threadID,
                messageID: info.messageID,
              },
              5 * 60 * 1000,
            );
          },
        );
      });
    }
  }
  async handleEvent({ api, event, getLang }: IPangolinHandleEvent) {
    if (event.type === "message_reply") {
      const reportInfo = cache.get("report");
      if (reportInfo && event.messageReply.messageID == reportInfo.messageID) {
        console.log(getLang("adminResponse", event.body), reportInfo);
        api.sendMessage(
          getLang("adminResponse", event.body),
          reportInfo.threadID,
          () => {},
        );
      }
    }
  }
}
