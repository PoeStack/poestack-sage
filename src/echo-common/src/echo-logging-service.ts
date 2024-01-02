import { LogLevel } from './log-level'
import { LoggingService, LoggingTarget } from './logging-service'

export class EchoLoggingService implements LoggingService {
  private readonly loggingTargets = new Set<LoggingTarget>()

  public constructor(private readonly activatedLogLevels: Set<LogLevel> = new Set()) {}

  public info<TPayload = unknown>(message: string, payload?: TPayload): void {
    this.log(LogLevel.Info, message, payload)
  }

  public debug<TPayload = unknown>(message: string, payload?: TPayload): void {
    this.log(LogLevel.Debug, message, payload)
  }

  public warn<TPayload = unknown>(message: string, payload?: TPayload): void {
    this.log(LogLevel.Warn, message, payload)
  }

  public error<TPayload = unknown>(message: string, payload?: TPayload): void {
    this.log(LogLevel.Error, message, payload)
  }

  public fatal<TPayload = unknown>(message: string, payload?: TPayload): void {
    this.log(LogLevel.Fatal, message, payload)
  }

  public trace<TPayload = unknown>(message: string, payload?: TPayload): void {
    this.log(LogLevel.Trace, message, payload)
  }

  public activateLogLevel(levels: LogLevel[]): LoggingService {
    levels
      .filter((level) => !this.activatedLogLevels.has(level))
      .forEach((level) => this.activatedLogLevels.add(level))

    return this;
  }

  public createChildLogger(name: string): LoggingService {
    // TODO: create a scoped child logger most likely just by adding a prefix to the name
    return new EchoLoggingService(this.activatedLogLevels)
  }

  public activateLoggingTarget(target: LoggingTarget): LoggingService {
    this.loggingTargets.has(target) || this.loggingTargets.add(target)

    return this
  }

  private log<TPayload>(logLevel: LogLevel, message: string, payload: TPayload): void {
    if (!this.activatedLogLevels.has(logLevel)) {
      return
    }

    this.loggingTargets.forEach((target) => {
      switch (logLevel) {
        case LogLevel.Info:
          target.info(message, payload)
          break
        case LogLevel.Debug:
          target.debug(message, payload)
          break
        case LogLevel.Warn:
          target.warn(message, payload)
          break
        case LogLevel.Error:
          target.error(message, payload)
          break
        case LogLevel.Fatal:
          target.fatal(message, payload)
          break
        case LogLevel.Trace:
          target.trace(message, payload)
          break
      }
    })
  }
}
