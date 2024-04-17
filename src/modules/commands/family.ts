// import Ifca from "src/types/type.api";
// import IEvent from "src/types/type.event";
// import sharp from "sharp";
// import axios from "axios";
// import { join } from "path";
// import * as fs from "fs";

// export default class NameCommand {
//   static config = {
//     name: "family", //your command name
//     version: "",
//     author: "",
//     createdAt: "",
//     description: {
//       vi: "",
//       en: "",
//     },
//     guide: {
//       vi: "",
//       en: "",
//     },
//   };

//   static message = {
//     vi: {
//       text1: "",
//       text2: "",
//     },
//     en: {
//       text1: "",
//       text2: "",
//     },
//   };

//   constructor(private client) {}

//   async run(
//     api,
//     event,
//     client,
//     args,
//     DataUser,
//     DataThread,
//     UserInThreadData,
//     getLang
//   ) {
//     const info: any = await new Promise((resolve, reject) => {
//       api.getThreadInfo(event.threadID, (err, info) => {
//         if (err) reject(err);
//         else resolve(info);
//       });
//     });

//     const imageBuffers = await Promise.all(
//       info.userInfo.map(async (user, index) => {
//         const res = await axios.get(user.thumbSrc, {
//           responseType: "arraybuffer",
//         });
//         return res.data;
//       })
//     );

//     const images = await Promise.all(
//       imageBuffers.map(async (buffer, index) => {
//         const pathSrcMember = join(
//           process.cwd(),
//           `/public/images/family_${event.threadID}_${index + 1}.jpg`
//         );
//         fs.writeFileSync(pathSrcMember, buffer);
//         return pathSrcMember;
//       })
//     );

//     const outputPath = join(
//       process.cwd(),
//       `/public/images/family_${event.threadID}.jpg`
//     );

//     await mergeImages(images, outputPath);
//     console.log("Images merged successfully");
//   }
// }

// async function mergeImages(imagePaths, outputPath) {
//   // Calculate the number of rows and columns needed to arrange the images
//   const numImages = imagePaths.length;
//   let rows = Math.ceil(Math.sqrt(numImages));
//   let cols = Math.ceil(numImages / rows);

//   const metadata = await Promise.all(
//     imagePaths.map(async (imagePath) => sharp(imagePath).metadata())
//   );

//   const maxWidth = Math.max(...metadata.map((data) => data.width));
//   const totalHeight = metadata.reduce((sum, data) => sum + data.height, 0);

//   await sharp({
//     create: {
//       width: maxWidth * cols, // Width of the output image
//       height: totalHeight * rows, // Height of the output image
//       channels: 4, // 4 channels for RGBA
//       background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
//     },
//   })
//     .composite(
//       imagePaths.map((imagePath, index) => ({
//         input: imagePath,
//         top: Math.floor(index / cols) * totalHeight, // Calculate top position based on row
//         left: (index % cols) * maxWidth, // Calculate left position based on column
//       }))
//     )
//     .toFile(outputPath);
// }
