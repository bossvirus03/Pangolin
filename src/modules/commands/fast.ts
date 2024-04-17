import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import fast from 'fast-speedtest-api';
export default class FastCommand {
  static config = {
    name: "fast", 
    version: "",
    author: "Nguyên Blue [convert] - nguồn niiozic team",
    createdAt: "",
    description: "",
  };

  constructor(private client) {}
  async run(
    api: Ifca,
    event: IEvent,
    client,
    args
  ) {
   try {
const speedTest = new fast({
			token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm",
			verbose: false,
			timeout: 10000,
			https: true,
			urlCount: 5,
			bufferSize: 8,
			unit: fast.UNITS.Mbps
		});
		const resault = await speedTest.getSpeed();
		return api.sendMessage(
			"🚀 Speed: " + resault + " Mbps",
			event.threadID, ()=>{}, event.messageID
		);
	}
	catch {
		return api.sendMessage("⚠️ Không thể speedtest ngay lúc này, hãy thử lại sau!", event.threadID, ()=>{}, event.messageID);
	}
  }
}
