import axios from "axios";
import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class MailCommand {
  static config = {
    category: "TOOL",
    name: "mail10m",
    version: "1.0.0",
    author: "Nguyên Blue",
    description: {
      vi: "Tạo gmail 10 phút",
      en: "Create gmail in 10 minutes",
    },
    guide: {
      vi: "[prefix]mail10m NEW/CHECK/GET",
      en: "[prefix]mail10m NEW/CHECK/GET",
    },
  };
  static message = {
    vi: {
      syntaxError:
        "Invalid command! Please use one of the following:\n- NEW: Tạo mail mới\n- CHECK: Check hộp thư đến\n- GET: Lấy mail hiện tại\n",
      info: "» Email: $0\n» ID Mail: $1\n» From: $2\n» Tiêu đề: $3\n» $4",
    },
    en: {
      syntaxError:
        "Invalid command! Please use one of the following:\n- NEW: Create new mail\n- CHECK: Check inbox\n- GET: Get current mail\n",
      info: "» Email: $0\n» Mail ID: $1\n» From: $2\n» Subject: $3\n» $4",
    },
  };

  constructor(private client) {}

  async run({ api, event, getLang, args }: IPangolinRun) {
    if (args[1] == "new") {
      const res = await axios.get(
        `https://10minutemail.net/address.api.php?new=1`,
      );
      const {
        mail_get_user,
        mail_get_host,
        mail_get_time,
        mail_server_time,
        mail_get_key,
        mail_left_time,
        mail_list,
      } = res.data;
      const { mail_id, subject, datetime2 } = mail_list[0];
      return api.sendMessage(
        `» Tên mail: ${mail_get_user}\n» Host: ${mail_get_host}\n» Mail: ${mail_get_user}@${mail_get_host}.com\n» Thời gian: ${mail_get_time}\n» Thời gian ở server: ${mail_server_time}\n» Key: ${mail_get_key}\n» Thời gian còn lại: ${mail_left_time}s\n» Mail ID: ${mail_id}\n» Nội dung: ${subject}\n» Date: ${datetime2}`,
        event.threadID,
      );
    } else if (args[1] == "more") {
      const res = await axios.get(
        `https://10minutemail.net/address.api.php?more=1`,
      );
      const {
        mail_get_user,
        mail_get_host,
        mail_get_time,
        mail_server_time,
        mail_get_key,
        mail_left_time,
        mail_list,
      } = res.data;
      const { mail_id, subject, datetime2 } = mail_list[0];
      return api.sendMessage(
        `» Tên mail: ${mail_get_user}\n» Host: ${mail_get_host}\n» Mail: ${mail_get_user}@${mail_get_host}.com\n» Thời gian: ${mail_get_time}\n» Thời gian ở server: ${mail_server_time}\n» Key: ${mail_get_key}\n» Thời gian còn lại: ${mail_left_time}s\n» Mail ID: ${mail_id}\n» Nội dung: ${subject}\n» Date: ${datetime2}`,
        event.threadID,
      );
    } else if (args[1] == "get") {
      const get = await axios.get(`https://10minutemail.net/address.api.php`);
      const { mail_get_mail, session_id, permalink } = get.data;
      const { url, key } = permalink;
      const urlMail = url.replace(/\./g, " . ");
      const mail = mail_get_mail.replace(/\./g, " . ");
      return api.sendMessage(
        `» Email: ${mail}\n» ID Mail: ${session_id}\n» Url Mail: ${urlMail}\n» Key Mail: ${key}`,
        event.threadID,
      );
    } else if (args[1] == "check") {
      const get = await axios.get(`https://10minutemail.net/address.api.php`);
      const { mail_list, mail_get_mail } = get.data;
      const { mail_id, from, subject, datetime2 } = mail_list[0];
      const formMail = from.replace(/\./g, " . ");
      const mail = mail_get_mail.replace(/\./g, " . ");
      return api.sendMessage(
        getLang("info", mail, mail_id, formMail, subject, datetime2),
        event.threadID,
      );
    } else {
      await api.sendMessage(getLang("syntaxError"), event.threadID);
    }
  }
}
