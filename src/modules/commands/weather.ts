import axios from "axios";
import { error } from "console";
import * as dayjs from "dayjs";
// import GetIpService from "libs/shared/common/services/get-IP.service";
export default class PingCommand {
  static config = {
    name: "weather",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
  };

  constructor(private client) {}

  async run(api, event, args) {
    const toDay = dayjs().format("YYYY-MM-DD");
    const getIp = await axios.get(
      `https://ipinfo.io?token=${process.env.YOUR_IPINFO_API_KEY}`
    );
    const getWeather = await axios.get(
      `https://api.weatherapi.com/v1/marine.json?q=${getIp.data.ip}&dt=${toDay}&lang=vi&key=${process.env.YOUR_WEATHER_API_KEY}`
    );
    if (getWeather) {
      let smg =
        `Thành phố: ${getWeather.data.location.name} - ${getWeather.data.location.country}\n` +
        `Ngày: ${dayjs().format("DD/MM/YYYY")}\n` +
        `Nhiệt độ cao nhất: ${getWeather.data.forecast.forecastday[0].day.maxtemp_c}°C\n` +
        `Nhiệt độ thấp nhất: ${getWeather.data.forecast.forecastday[0].day.mintemp_c}°C\n` +
        `Tình trạng: ${getWeather.data.forecast.forecastday[0].day.condition.text}`;
      api.sendMessage(smg, event.threadID, event.messageID);
      return;
    }
    api.sendMessage("Không có dữ liệu!");
  }
}
