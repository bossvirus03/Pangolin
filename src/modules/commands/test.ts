const axios = require("axios");
import { applyIsOptionalDecorator } from "@nestjs/mapped-types";
import { IPangolinRun } from "src/types/type.pangolin-handle";
export default class TachCommand {
  static config = {
    category: "",
    name: "test",
    version: "1.0.0",
    author: "Nguyên Blue",

    description:
      "Cách dùng: [prefix]tach (Reply 1 bức ảnh)\nChức năng: tách nền ảnh",
  };

  constructor(private client) {}

  async run({ api, event, UserData }: IPangolinRun) {
    // const function = new Function();
    const axios = require("axios");
    const url = `https://graph.facebook.com/234/picture?type=large&redirect=false&width=480&height=480&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    //vd0
    // const data = axios.get(url);
    // console.log(data);

    // vd1
    const data = await axios.get(url);
    api.sendMessage("hello world", event.threadID);

    console.log(data);
  }
}
