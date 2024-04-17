import axios from "axios";
import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";

export default class WikiCommand {
  static config = {
    name: "wiki",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
  };

  constructor(private client) {}

  async run({ api, event, client, args }) {
    let content = args.join(" ");
    let url = `https://vi.wikipedia.org/w/api.php?action=query&prop=extracts&format=json& =&titles=${event.body}`;
    // if (args[0] == "en") {
    //   url = "https://en.wikipedia.org/w/api.php";
    //   content = args.slice(1, args.length);
    // }
    // if (!content)
    //   return api.sendMessage("Missing input", event.threadID, event.messageID);
    // return wiki({ apiUrl: url })
    //   .page(content)
    //   .catch(() =>
    //     api.sendMessage("Not found", event.threadID, event.messageID)
    //   )
    //   .then((page) =>
    //     typeof page != "undefined"
    //       ? Promise.resolve(page.summary()).then((val) =>
    //           api.sendMessage(val, event.threadID, event.messageID)
    //         )
    //       : ""
    //   );
    const wikiResponse = await axios.get(url);
    console.log(wikiResponse.data.query);
  }
}
