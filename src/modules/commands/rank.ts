import * as fs from "fs";
import { join } from "path";
import { createCanvas, loadImage } from "canvas";
import axios from "axios";

export default class RankCommand {
  static config = {
    category: "GROUP",
    name: "rank",
    version: "1.0.0",
    author: "Lợi",

    description:
      "Cách dùng: [prefix]rank\nChức năng: Lấy thông tin rank của người dùng",
  };

  constructor(private client) {}

  drawRoundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
  }

  async createRankCard(
    top,
    avt,
    name,
    currentLevel,
    currentExp,
    futureExp,
    percentLevel,
  ) {
    const canvas = createCanvas(1133, 370);
    const ctx = canvas.getContext("2d");
    const cardTemplatePath = join(
      process.cwd(),
      "src",
      "db",
      "data",
      "rank",
      "card",
      "card.png",
    );
    const template = await loadImage(cardTemplatePath);

    // Tính toán tỷ lệ giữa chiều rộng và chiều cao của canvas và hình ảnh
    const ratio = Math.min(
      canvas.width / template.width,
      canvas.height / template.height,
    );

    // Tính toán kích thước mới của hình ảnh để cover canvas mà không bị méo
    const newWidth = template.width * ratio;
    const newHeight = template.height * ratio;

    // Vẽ hình ảnh với kích thước mới, sử dụng center để căn giữa canvas
    const offsetX = (canvas.width - newWidth) / 2;
    const offsetY = (canvas.height - newHeight) / 2;

    ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

    const totalWidth = 702; // Độ rộng của thanh trạng thái
    const totalHeight = 47; // Độ cao của thanh trạng thái
    const currentValue = currentExp; // Giá trị hiện tại
    const futureValue = futureExp; // Giá trị tương lai

    // Vẽ hình chữ nhật đại diện cho toàn bộ thanh trạng thái với góc bo tròn
    ctx.fillStyle = "#ccc";
    this.drawRoundRect(ctx, 372, 260, totalWidth, totalHeight, 20);

    // Tính toán chiều rộng của hình chữ nhật đại diện cho giá trị hiện tại
    const currentWidth = (currentValue / futureValue) * totalWidth;

    // Vẽ hình chữ nhật nhỏ hơn đại diện cho giá trị hiện tại
    ctx.fillStyle = "#008DDA";
    this.drawRoundRect(ctx, 372, 260, currentWidth, totalHeight, 20);

    // Vẽ chữ hiển thị % level
    ctx.fillStyle = "#ccc";
    ctx.font = "italic bold 32px Arial";
    ctx.fillText(`${percentLevel}%`, 696, 295);

    // Vẽ chữ hiển thị Tên
    ctx.fillStyle = "#fccf03";
    ctx.font = "italic bold 56px Arial";
    ctx.fillText(`${name}`, 450, 157);

    // Vẽ chữ hiển top
    ctx.fillStyle = "#ccc";
    ctx.font = "italic bold 36px Arial";
    ctx.fillText(`#${top}`, 700, 85);

    //thông tin level Nal/Nal và level hiện tại
    ctx.font = "italic bold 36px Arial";
    ctx.fillStyle = "#ccc";
    ctx.fillText(`${currentLevel}`, 1030, 85);
    ctx.fillText(`${currentExp} /${futureExp}`, 800, 85);

    // Vẽ hình tròn để cắt ảnh avatar
    ctx.beginPath();
    ctx.arc(180, 187, 147, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(await loadImage(avt), 36, 40, 328, 328);
    const fimg = canvas.toBuffer("image/png");
    return fimg;
  }

  async run({ api, event, client, args, UserData, pangolin }) {
    const getTopRank = async (id) => {
      let listUsers = await UserData.getAll();
      listUsers.sort((a, b) => b.exp - a.exp);
      const index = 1 + listUsers.findIndex((user) => user.uid === id);
      return index;
    };
    const top = await getTopRank(event.senderID);
    const avt = `https://graph.facebook.com/${event.senderID}/picture?type=large&redirect=true&width=480&height=480&access_token=${pangolin.access_token}`;
    const avtUrl = await axios.get(avt, { responseType: "arraybuffer" });
    const user = await UserData.get(event.senderID);
    const currentExp = user.exp;

    const currentLevel = Math.floor(Math.sqrt(1 + (4 * user.exp) / 3 + 1) / 2);
    const nextLevelExp = Math.floor(
      (2 * (2 * Math.pow(currentLevel + 1, 2) - 1) * 3) / 4,
    );
    const nextLevel = Math.floor(
      Math.floor(Math.sqrt(1 + (4 * nextLevelExp) / 3 + 1) / 2),
    );
    const futureExp = Math.floor(nextLevelExp);
    const percentLevel = Math.floor((currentExp / nextLevelExp) * 100);

    console.log("Creating rank card...");
    const outputPath = join(
      process.cwd(),
      `/public/images/rank_${event.senderID}.png`,
    );

    const buffer = await this.createRankCard(
      top,
      avtUrl.data,
      user.name,
      currentLevel,
      currentExp,
      nextLevelExp,
      percentLevel,
    );
    fs.writeFileSync(outputPath, buffer);
    api.sendMessage(
      {
        attachment: fs.createReadStream(outputPath),
      },
      event.threadID,
    );
  }
}
