import { IPangolinRun } from "src/types/type.pangolin-handle";
import axios from "axios";
import fs from "fs";
import moment from "moment-timezone";
import { error } from "console";

export default class GithubCommand {
  static config = {
    name: "github",
    category: "INFO",
    version: "1.0.0",
    author: "Nguyên Blue",
    description: {
      vi: "Lấy thông tin github",
      en: "Get github information",
    },
    guide: {
      vi: "[prefix]github",
      en: "[prefix]github",
    },
  };

  static message = {
    vi: {
      isEmptyUsername: `Username github không được để trống!`,
      invalidUsername: `Không tìm thấy người dùng | Vui lòng cho tôi một tên người dùng hợp lệ!`,
      info: `╭─────────────⭓\n│Leta Tên người dùng: $0\n│></ID: $1\n│> Bio: $2\n│></Kho lưu trữ công khai: $3\n│></Người theo dõi: $4\n│> Đang theo dõi: $5\n│></Location: $6\n│></Tài khoản đã tạo: $7 - $8\ n╰─────────────⭓`,
      error: "Đã xảy ra lỗi khi thực hiện yêu cầu.",
    },
    en: {
      invalidUsername: `User Not Found | Please Give Me A Valid Username!`,
      isEmptyUsername: `github username cannot be empty!`,
      info: `╭─────────────⭓\n│› Username: $0\n│› ID: $1\n│› Bio: $2\n│› Public Repositories: $3\n│› Followers: $4\n│› Following: $5\n│› Location: $6\n│› Account Created: $7 - $8\n╰─────────────⭓`,
      error: "An error occurred while making the request.",
    },
  };
  constructor(private client) {}

  async run({ api, event, getLang, args }: IPangolinRun) {
    try {
      if (!args[1])
        return api.sendMessage(
          getLang("isEmptyUsername"),
          event.threadID,
          () => {},
          event.messageID,
        );

      const response = await axios.get(
        `https://api.github.com/users/${encodeURI(args.slice(1).join(" "))}`,
      );
      const body = response.data;

      if (body.message)
        return api.sendMessage(
          getLang("invalidUsername"),
          event.threadID,
          () => {},
          event.messageID,
        );

      let {
        login,
        avatar_url,
        name,
        id,
        html_url,
        public_repos,
        followers,
        following,
        location,
        created_at,
        bio,
      } = body;
      const info = getLang(
        "info",
        login,
        id,
        bio || "No bio",
        public_repos || "None",
        followers,
        following,
        location || "No location",
        moment(created_at).format("HH:mm:ss"),
        moment(created_at).format("DD/MM/YYYY"),
      );

      const avatarResponse = await axios.get(avatar_url, {
        responseType: "arraybuffer",
      });
      const avatarData = Buffer.from(avatarResponse.data, "utf-8");
      fs.writeFileSync("./public/images/avatargithub.png", avatarData);

      api.sendMessage(
        {
          attachment: fs.createReadStream("./public/images/avatargithub.png"),
          body: info,
        },
        event.threadID,
        () => fs.unlinkSync("./public/images/avatargithub.png"),
        event.messageID,
      );
    } catch (error) {
      api.sendMessage(getLang("error"), event.threadID);
    }
  }
}
