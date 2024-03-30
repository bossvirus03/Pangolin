import axios from "axios";
import * as cache from "memory-cache";
import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
export default class AiCommand {
  static config = {
    name: "ai",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description: {
      vi: "đặt câu hỏi gì đó cho chat gpt",
      en: "ask question to chat GPT",
    },
    guide: {
      vi: "[prefix]ai [on/off] rồi nhắn question: [ câu hỏi ]",
      en: "[prefix]ai [on/off] and then question: [ question ]",
    },
  };

  static message = {
    vi: {
      running: "Chat bot ai đang hoạt động!",
      disabled: "Chat bot AI đã tắt!",
    },
    en: {
      running: "Chat bot ai is running!",
      disabled: "Chat bot AI is disabled!",
    },
  };

  constructor(private client) {}

  async run(
    api: Ifca,
    event: IEvent,
    client,
    args,
    DataUser,
    DataThread,
    UserInThreadData,
    getLang
  ) {
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
        threadID: event.threadID,
      });
      cache.put("command-event-on", prevCommandEventOn, 60 * 1000 * 5); // Time in ms
      api.sendMessage(getLang("running"), event.threadID);
    }
    if (args[1] == "off") {
      const newPrevCommandEventOn = prevCommandEventOn.filter(
        (item) => item.command != "ai" && item.threadID != event.threadID
      );
      cache.put("command-event-on", newPrevCommandEventOn, 60 * 1000 * 5); // Time in ms
      api.sendMessage(getLang("disabled"), event.threadID);
    }

    // handle logic event

    async function handleCallGpt(threadID, event) {
      const options = {
        method: "POST",
        url: "https://chatgpt-42.p.rapidapi.com/conversationgpt4",
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key":
            "70d6c3fedfmshd34b0c87b9f894dp131cc7jsn08a2dc9842da",
          "X-RapidAPI-Host": "chatgpt-42.p.rapidapi.com",
        },
        data: {
          messages: [
            {
              role: "user",
              content:
                event.body.split("question:")[1].trim() ||
                event.body.split("question :")[1].trim() ||
                event.body.split("Question :")[1].trim() ||
                event.body.split("Question:")[1].trim(),
            },
          ],
          system_prompt: "",
          temperature: 0.9,
          top_k: 5,
          top_p: 0.9,
          max_tokens: 2560,
          web_access: false,
        },
      };
      try {
        const response = await axios.request(options);
        return response.data;
      } catch (error) {
        console.error(error);
      }
    }

    if (args[0] == "ai") return;
    // event.body as string
    if ((event.body as string).startsWith("question:")) {
      const check = cache
        .get("command-event-on")
        .some(
          async (item) =>
            item.threadID == event.threadID && item.command == "ai"
        );
      if (check) {
        const response = await handleCallGpt(event.threadID, event);
        api.sendMessage(`AI respose: ${response.result}`, event.threadID);
      }
    }
  }
}
