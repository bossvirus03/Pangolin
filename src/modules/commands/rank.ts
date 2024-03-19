import { readdirSync } from "fs";
import * as fs from "fs";
import { join } from "path";
import { createCanvas, loadImage } from "canvas";
import axios from "axios";
export default class RankCommand {
  static config = {
    name: "rank",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description:
      "Cách dùng[prefix]rank\nChức năng: Lấy thông tin rank của người dùng",
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
    avt,
    name,
    currentLevel,
    futureExp,
    nowExp,
    percentLevel
  ) {
    const canvas = createCanvas(1133, 370);
    const ctx = canvas.getContext("2d");
    const cardTemplatePath = join(
      process.cwd(),
      "src",
      "database",
      "data",
      "rank",
      "card",
      "card.png"
    );

    const template = await loadImage(cardTemplatePath);

    // Tính toán tỷ lệ giữa chiều rộng và chiều cao của canvas và hình ảnh
    const ratio = Math.min(
      canvas.width / template.width,
      canvas.height / template.height
    );

    // Tính toán kích thước mới của hình ảnh để cover canvas mà không bị méo
    const newWidth = template.width * ratio;
    const newHeight = template.height * ratio;

    // Vẽ hình ảnh với kích thước mới, sử dụng center để căn giữa canvas
    const offsetX = (canvas.width - newWidth) / 2;
    const offsetY = (canvas.height - newHeight) / 2;

    // ctx.drawImage(template, offsetX, offsetY, newWidth, newHeight);

    ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

    const totalWidth = 702; // Độ rộng của thanh trạng thái
    const totalHeight = 47; // Độ cao của thanh trạng thái
    const currentValue = nowExp; // Giá trị hiện tại
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
    ctx.fillStyle = "#000000"; // Màu đen
    ctx.font = "italic bold 46px Arial";
    ctx.fillText(`${name}`, 372, 209);

    //thông tin level Nal/Nal và level hiện tại
    ctx.font = "italic bold 36px Arial";
    ctx.fillStyle = "#ccc";
    ctx.fillText(`${currentLevel}`, 1030, 85);
    ctx.fillText(`${nowExp} /${futureExp}`, 800, 85);

    // Vẽ hình tròn để cắt ảnh avatar
    ctx.beginPath();
    ctx.arc(180, 187, 147, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(await loadImage(avt), 36, 40, 328, 328);

    const fimg = canvas.toBuffer();
    await fs.writeFileSync(
      join(
        process.cwd(),
        "src",
        "database",
        "data",
        "rank",
        "card",
        "card2.png"
      ),
      fimg
    );
    ctx.fillText(currentLevel, 485, 330.42);
    return fimg;
  }
  async run(api, event, client, args, DataUser, DataThread) {
    const countExp = (level) => {
      return (3 * (-2 + Math.pow(level * 2, 2))) / 4;
    };
    const avt = `https://graph.facebook.com/${event.senderID}/picture`;
    const avtUrl = await axios.get(avt, {
      params: {
        width: 480,
        height: 480,
        redirect: false,
        access_token: process.env.ACCESS_TOKEN_FB,
      },
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0",
        Cookie:
          "sb=8lroZVbhKmJEmxTrSDlPeHY9; datr=8lroZWMAuHuZ9TskwZTJyFdg; dpr=0.8999999761581421; ps_n=0; ps_l=0; locale=en_US; c_user=100049732817959; xs=40%3AgJstZorKeBXc5w%3A2%3A1710512151%3A-1%3A6398%3A%3AAcVIJX6w33kD_DcG29ZqFgwb4iHpNf3pq72mHqBtn_Q; fr=1kHbVtj4uFeqpFDHL.AWUKIvembjxLw0xsPDDvx9BASxY.Bl-UX4..AAA.0.0.Bl-UbQ.AWUIZZEoe4Y; wd=1872x958; presence=EDvF3EtimeF1710835746EuserFA21B49732817959A2EstateFDutF0CEchF_7bCC; usida=eyJ2ZXIiOjEsImlkIjoiQXNhbDVjNng3dzN0aiIsInRpbWUiOjE3MTA4MzU4NDR9",
      },
    });
    // let avt = await api.getUserInfo(event.senderID, (err, ret) => {});
    // avt = avt[event.senderID].thumbSrc;
    const user = await DataUser.get(event.senderID);
    const currentLevel = Math.floor(Math.sqrt(1 + (4 * user.exp) / 3 + 1) / 2);
    const futureExp = Math.floor(countExp(currentLevel + 1));
    const nowExp = Math.floor(countExp(currentLevel));
    const percentLevel = Math.floor((nowExp / futureExp) * 100);

    this.createRankCard(
      avtUrl.data.url,
      user.name,
      currentLevel,
      futureExp,
      user.exp,
      percentLevel
    );

    setTimeout(async () => {
      api.sendMessage(
        {
          attachment: await fs.createReadStream(
            join(
              process.cwd(),
              "src",
              "database",
              "data",
              "rank",
              "card",
              "card2.png"
            )
          ),
        },
        event.threadID
      );
    }, 2000);

    // ! TODO làm phần tag để get rank
    // if (!args[1]) return api.sendMessage(event.senderID, event.threadID);
    // const propertyValues = Object.keys(event.mentions);
    // propertyValues.forEach((item) => {
    //   api.sendMessage(item, event.threadID);
    // });
  }
}
