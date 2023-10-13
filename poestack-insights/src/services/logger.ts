export class Logger {
  public static init() {}

  public static info(message: string, ...meta: any[]) {
    console.log(message, ...meta);
  }

  public static error(message: string, ...meta: any[]) {
    console.error(message, ...meta);
  }

  public static debug(message: string, ...meta: any[]) {
    console.debug(message, ...meta);
  }
}
