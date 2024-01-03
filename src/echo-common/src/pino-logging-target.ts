import pino, { Logger, LoggerOptions } from 'pino'
import { LoggingTarget } from './logging-service'

export class PinoLoggingTarget implements LoggingTarget {
  private constructor(private readonly logger: Logger) {}

  public static create(pinoOptions?: LoggerOptions): PinoLoggingTarget {

    return new PinoLoggingTarget(pino(pinoOptions))
  }

  public info<TPayload = unknown>(message: string, payload?: TPayload | undefined): void {
    this.logger.info(message, payload)
  }

  public debug<TPayload = unknown>(message: string, payload?: TPayload | undefined): void {
    this.logger.debug(message, payload)
  }

  public warn<TPayload = unknown>(message: string, payload?: TPayload | undefined): void {
    this.logger.warn(message, payload)
  }

  public error<TPayload = unknown>(message: string, payload?: TPayload | undefined): void {
    this.logger.error(message, payload)
  }

  public fatal<TPayload = unknown>(message: string, payload?: TPayload | undefined): void {
    this.logger.fatal(message, payload)
  }

  public trace<TPayload = unknown>(message: string, payload?: TPayload | undefined): void {
    this.logger.trace(message, payload)
  }
}
