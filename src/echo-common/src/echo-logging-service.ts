import { LogLevel } from './log-level'
import { LoggingService, LoggingTarget } from './logging-service'

export class EchoLoggingService implements LoggingService {
  private readonly loggingTargets = new Set<LoggingTarget>()
  private prefix = '[ECHO_APP]'

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
    const loggingService = new EchoLoggingService(this.activatedLogLevels)

    for (const target of this.loggingTargets) {
      loggingService.activateLoggingTarget(target)
    }

    return loggingService.activateLogLevel([...this.activatedLogLevels]).assignScope(`[ECHO_PLUGIN-${name}]`)
  }

  public activateLoggingTarget(target: LoggingTarget): LoggingService {
    this.loggingTargets.has(target) || this.loggingTargets.add(target)

    return this
  }

  private log<TPayload>(logLevel: LogLevel, message: string, payload: TPayload): void {
    if (!this.activatedLogLevels.has(logLevel)) {
      return
    }

    const prefixedMessage = `${this.prefix}: ${message}`

    this.loggingTargets.forEach((target) => {
      switch (logLevel) {
        case LogLevel.Info:
          target.info(prefixedMessage, payload)
          break
        case LogLevel.Debug:
          target.debug(prefixedMessage, payload)
          break
        case LogLevel.Warn:
          target.warn(prefixedMessage, payload)
          break
        case LogLevel.Error:
          target.error(prefixedMessage, payload)
          break
        case LogLevel.Fatal:
          target.fatal(prefixedMessage, payload)
          break
        case LogLevel.Trace:
          target.trace(prefixedMessage, payload)
          break
      }
    })
  }

  public assignScope(prefix: string): LoggingService {
      this.prefix = prefix

      return this
  }
}
