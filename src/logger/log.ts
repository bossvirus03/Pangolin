import * as colors from "colors";
export class CustomLogger {
  error(text: string) {
    console.log(colors.red("[ERR]" + text));
  }
  warn(text: string) {
    console.log(("[WARN]" + text).yellow);
  }
  info(text: string) {
    console.log(colors.white(text));
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
  rainbow(text: string) {
    console.log(colors.rainbow(text));
  }
  bg(text: string) {}
}
