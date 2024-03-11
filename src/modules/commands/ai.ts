import axios from "axios";
import * as cache from "memory-cache";
import OpenAI from "openai";
export default class AiCommand {
  static config = {
    name: "ai",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
  };

  constructor(private client) {}

  async run(api, event, args) {
    // handle pre command event
    function getPrevCommandEvent() {
      const cachedArray = cache.get("command-event-on");
      if (cachedArray) {
        return cachedArray;
      } else {
        console.log("Array not found in cache. Fetching from the source.");
        return [];
      }
    }

    // handle switch AI
    let prevCommandEventOn = getPrevCommandEvent();
    if (args[1] == "on") {
      prevCommandEventOn.push({
        command: "ai",
        threadID: event.threadID || event.messageID,
      });
      cache.put("command-event-on", prevCommandEventOn, 6 * 1000 * 5); // Time in ms
      api.sendMessage(
        "Chat bot ai is running",
        event.threadID,
        event.messageID
      );
    }
    if (args[1] == "off") {
      const newPrevCommandEventOn = prevCommandEventOn.filter(
        (item) => item.command !== "ai"
      );
      cache.put("command-event-on", newPrevCommandEventOn, 6 * 1000 * 5); // Time in ms
      api.sendMessage(
        "Chat bot AI is disabled!!",
        event.threadID,
        event.messageID
      );
    }

    // handle logic event
    if (args[0] == "ai") return;
    if (
      1 ||
      event.body.startsWith("GPT:") ||
      event.body.startsWith("question:")
    ) {
      cache.get("command-event-on").forEach((command) => {
        if (command.threadID == event.threadID) {
          handleCallGpt(event.threadID, event.body);
        }
      });
      async function handleCallGpt(threadID, body) {
        // const openai = new OpenAI({
        //   apiKey: process.env["OPENAI_API_KEY"],
        // });

        // async function main() {
        //   const completion = await openai.chat.completions.create({
        //     messages: [
        //       { role: "system", content: "You are a helpful assistant." },
        //     ],
        //     model: "gpt-3.5-turbo",
        //   });

        //   console.log(completion.choices[0]);
        // }

        // main();
        api.sendMessage("AI respose: ", event.threadID, event.messageID);
      }
    }
  }
}
