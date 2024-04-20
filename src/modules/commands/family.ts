import axios from "axios";
import { join } from "path";
import * as fs from "fs";
import { createCanvas, loadImage } from "canvas";
import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class NameCommand {
  static config = {
    category: "GROUP",
    name: "family", //your command name
    version: "",
    author: "",

    description: {
      vi: "",
      en: "",
    },
    guide: {
      vi: "",
      en: "",
    },
  };

  static message = {
    vi: {
      text1: "",
      text2: "",
    },
    en: {
      text1: "",
      text2: "",
    },
  };

  constructor(private client) {}

  async run({
    api,
    event,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
  }: IPangolinRun) {
    const canvasWidth = 1920;
    const canvasHeight = 2880;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");
    const outputPath = join(
      process.cwd(),
      `/public/images/family_${event.threadID}.jpg`,
    );
    // hàm để tính tổng số hình ảnh trên mỗi chiều
    function calculateGridSize(imageList) {
      const totalImages = imageList.length;
      const sqrt = Math.sqrt(totalImages);
      const columns = Math.ceil(sqrt);
      const rows = Math.ceil(totalImages / columns);
      return { columns, rows };
    }
    // hàm để vẽ các hình ảnh nhỏ lên canvas với gap
    async function drawListMember(imageList, backgroundImageSrc, title) {
      const { columns, rows } = calculateGridSize(imageList);
      const imageSize = Math.min(
        (canvasWidth - 100) / columns,
        (canvasHeight - 400) / rows,
      ); // Kích thước của mỗi hình ảnh
      const gap = 2; // khoảng cách giữa các hình ảnh

      // Tạo canvas background
      const backgroundCanvas = createCanvas(canvasWidth, canvasHeight);
      const backgroundCtx = backgroundCanvas.getContext("2d");

      // Vẽ hình nền
      const backgroundImage = await loadImage(backgroundImageSrc);
      backgroundCtx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

      // Tính toán kích thước và vị trí của khung chứa tất cả hình ảnh
      const totalWidth = columns * (imageSize + gap) - gap;
      const totalHeight = rows * (imageSize + gap) - gap;
      const startXPos = (canvasWidth - totalWidth) / 2; // Vị trí bắt đầu vẽ theo chiều ngang
      const startYPos = 900; // Vị trí bắt đầu vẽ theo chiều dọc

      let xPos = startXPos;
      let yPos = startYPos;

      // Tính toán kích thước của tiêu đề và điểm bắt đầu vẽ
      backgroundCtx.fillStyle = "#000"; // Màu chữ
      let fontSize = 120;
      while (backgroundCtx.measureText(title).width > totalWidth) {
        fontSize--;
      }
      const textWidth = backgroundCtx.measureText(title).width;
      const textXPos = startXPos + (totalWidth - textWidth) / 2;
      const textYPos = startYPos - 380;

      // Vẽ tiêu đề
      backgroundCtx.textAlign = "center"; // Căn giữa theo chiều ngang
      wrapText(
        backgroundCtx,
        title,
        textXPos + textWidth / 2,
        textYPos,
        canvasWidth - 70,
        fontSize,
      );

      // Vẽ khung cho hình ghép
      backgroundCtx.fillStyle = "#000000";
      backgroundCtx.fillRect(
        startXPos - 5,
        startYPos - 5,
        totalWidth + 10,
        totalHeight + 10,
      ); // Kích thước của khung

      // Đặt màu cho các ô trống
      backgroundCtx.fillStyle = "#cccccc";

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          const index = i * columns + j;
          const imageSrc = imageList[index];
          if (!imageSrc) {
            backgroundCtx.fillRect(xPos, yPos, imageSize, imageSize); // Vẽ ô màu #cccccc
          } else {
            const image = await loadImage(imageSrc);
            backgroundCtx.drawImage(image, xPos, yPos, imageSize, imageSize);
          }

          xPos += imageSize + gap; // Thêm khoảng cách vào vị trí x
        }
        xPos = startXPos; // Reset vị trí x cho hàng tiếp theo
        yPos += imageSize + gap; // Thêm khoảng cách vào vị trí y
      }

      return backgroundCanvas.toBuffer("image/jpeg");
    }

    // Hàm để xuống dòng nếu tiêu đề quá dài
    async function wrapText(context, text, x, y, maxWidth, fontSize) {
      let words = text.split(" ");
      let line = "";
      let lineHeight = fontSize * 1.2;
      let startY = y;
      context.font = `bold ${fontSize}px Arial`;
      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + " ";
        let metrics = context.measureText(testLine);
        let testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          context.fillText(line.trim(), x, startY);
          line = words[n] + " ";
          startY += lineHeight;
        } else {
          line = testLine;
        }
      }
      context.fillText(line.trim(), x, startY);
    }

    const info: any = await new Promise((resolve, reject) => {
      api.getThreadInfo(event.threadID, (err, info) => {
        if (err) reject(err);
        else resolve(info);
      });
    });
    const imageBuffers = await Promise.all(
      info.userInfo.map(async (user, index) => {
        const res = await axios.get(user.thumbSrc, {
          responseType: "arraybuffer",
        });
        return res.data;
      }),
    );
    const images = await Promise.all(
      imageBuffers.map(async (buffer, index) => {
        const pathSrcMember = join(
          process.cwd(),
          `/public/images/family_${event.threadID}_${index + 1}.jpg`,
        );
        fs.writeFileSync(pathSrcMember, buffer);
        return pathSrcMember;
      }),
    );
    const backGroundImagePath = join(
      process.cwd(),
      `/src/db/data/family/background.jpg`,
    );
    drawListMember(images, backGroundImagePath, info.name)
      .then((buffer) => {
        console.log("The JPEG image buffer was created.");
        fs.writeFileSync(outputPath, buffer);
        api.sendMessage(
          {
            attachment: fs.createReadStream(outputPath),
          },
          event.threadID,
        );
      })
      .catch((error) => {
        console.error("An error occurred:", error);
      });
  }
}
