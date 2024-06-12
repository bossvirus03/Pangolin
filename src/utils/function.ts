import axios from "axios";
import * as cheerio from "cheerio";
export async function findUid(link) {
  //function from goat bot
  try {
    const response = await axios.post(
      "https://seomagnifier.com/fbid",
      new URLSearchParams({
        facebook: "1",
        sitelink: link,
      }),
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          Cookie: "PHPSESSID=0d8feddd151431cf35ccb0522b056dc6",
        },
      },
    );
    const id = response.data;
    // try another method if this one fails
    if (isNaN(id)) {
      const html = await axios.get(link);
      const $ = cheerio.load(html.data);
      const el = $('meta[property="al:android:url"]').attr("content");
      if (!el) {
        throw new Error("UID not found");
      }
      const number = el.split("/").pop();
      return number;
    }
    return id;
  } catch (error) {
    throw new Error("An unexpected error occurred. Please try again.");
  }
}
