import axios from "axios";
class GetIpService {
  get() {
    const apiKey = process.env.YOUR_IPINFO_API_KEY
    const apiUrl = `https://ipinfo.io?token=${apiKey}`;
    const response = axios.get(apiUrl).catch((error) => {
      console.error("Error fetching IP information:", error);
    });
    return response;
  }
}
export default GetIpService;
