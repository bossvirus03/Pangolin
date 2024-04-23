import * as colors from "colors";
export class CustomLogger {
  warn(...text) {
    let res = "";
    text.forEach((arg) => {
      res += arg + " ";
    });
    console.log(("[WARN]" + res).yellow);
  }
  info(...text) {
    let res = "";
    text.forEach((arg) => {
      res += arg + " ";
    });
    console.log(("[WARN]" + res).blue);
  }
  green(text: string) {
    console.log(colors.green(text));
  }
  red(text: string) {
    console.log(colors.red(text));
  }
  yellow(text: string) {
    console.log(text.yellow);
  }
  blue(text: string) {
    console.log(colors.blue(text));
  }
  rainbow(...text) {
    let res = "";
    text.forEach((arg) => {
      res += arg + " ";
    });
    console.log(colors.rainbow(res));
  }
  bg(text: string) {}
}
