import axios from "axios";

export default class MangaCommand {
  static config = {
    name: "manga",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
  };

  constructor(private client) {}

  async run(api, event, args) {
    const search = event.body.split("|")[1].trim();
    // console.log("check search", search);

    if (args[1] == "search") {
      try {
        const response = await axios.get("https://trumtruyen.vn/ajax.php", {
          params: {
            type: "quick_search",
            str: search,
          },
        });
        const rawLinks = response.data.split("<a");

        // Loại bỏ phần tử cuối cùng (kết quả tìm kiếm)
        rawLinks.pop();

        // Xử lý từng phần tử để lấy thông tin về href và title
        const result = rawLinks.map((rawLink) => {
          const hrefStart = rawLink.indexOf('href="') + 6;
          const hrefEnd = rawLink.indexOf('"', hrefStart);
          const href = rawLink.slice(hrefStart, hrefEnd);

          const titleStart = rawLink.indexOf('title="') + 7;
          const titleEnd = rawLink.indexOf('"', titleStart);
          const title = rawLink.slice(titleStart, titleEnd);

          return { href, title };
        });

        // console.log(response.data);

        let smg = "";
        let i = 0;
        for (let item of result) {
          if (i > 0) {
            smg += `[${i}] ${item.title} \n Link: ${item.href}\n\n`;
          }
          i++;
        }
        // console.log("IIIIII", i);

        if (i == 1) {
          api.sendMessage(
            "Không tìm thầy kết quả!",
            event.threadID,
            event.messageID
          );
          return;
        }
        api.sendMessage(smg, event.threadID, event.messageID);
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    }
  }
}
