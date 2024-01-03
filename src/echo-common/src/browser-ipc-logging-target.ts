import { LogLevel } from "./log-level";
import { LoggingTarget } from "./logging-service";

export type IpcLoggingDelegate = (logLevel: LogLevel, message: string, payload?: unknown) => void;

export class BrowserIpcLoggingTarget implements LoggingTarget {
  public constructor(
    private ipcLoggingDelegate: IpcLoggingDelegate,
  ) {}

  public info<TPayload = unknown>(message: string, payload?: TPayload | undefined): void {
    this.ipcLoggingDelegate(LogLevel.Info, message, payload);
  }

  public debug<TPayload = unknown>(message: string, payload?: TPayload | undefined): void {
    this.ipcLoggingDelegate(LogLevel.Debug, message, payload);
  }

  public warn<TPayload = unknown>(message: string, payload?: TPayload | undefined): void {
    this.ipcLoggingDelegate(LogLevel.Warn, message, payload);
  }

  public error<TPayload = unknown>(message: string, payload?: TPayload | undefined): void {
    this.ipcLoggingDelegate(LogLevel.Error, message, payload);
  }

  public fatal<TPayload = unknown>(message: string, payload?: TPayload | undefined): void {
    this.ipcLoggingDelegate(LogLevel.Fatal, message, payload);
  }

  public trace<TPayload = unknown>(message: string, payload?: TPayload | undefined): void {
    this.ipcLoggingDelegate(LogLevel.Trace, message, payload);
  }
}
