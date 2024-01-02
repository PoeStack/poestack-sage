import { LogLevel } from "./log-level";

export interface LoggingTarget {
  /**
   * Adds a log entry on the info level.
   * 
   * @param message The message to log.
   * @param payload An optional payload to log.
   */
  info<TPayload = unknown>(message: string, payload?: TPayload): void;

  /**
   * Adds a log entry on the debug level.
   * 
   * @param message The message to log.
   * @param payload An optional payload to log.
   */
  debug<TPayload = unknown>(message: string, payload?: TPayload): void;

  /**
   * Adds a log entry on the warn level.
   * 
   * @param message The message to log.
   * @param payload An optional payload to log.
   */
  warn<TPayload = unknown>(message: string, payload?: TPayload): void;

  /**
   * Adds a log entry on the error level.
   * 
   * @param message The message to log.
   * @param payload An optional payload to log.
   */
  error<TPayload = unknown>(message: string, payload?: TPayload): void;

  /**
   * Adds a log entry on the fatal level.
   * 
   * @param message The message to log.
   * @param payload An optional payload to log.
   */
  fatal<TPayload = unknown>(message: string, payload?: TPayload): void;

  /**
   * Adds a log entry on the trace level.
   * 
   * @param message The message to log.
   * @param payload An optional payload to log.
   */
  trace<TPayload = unknown>(message: string, payload?: TPayload): void;
}

/**
 * A service for logging.
 */
export interface LoggingService extends LoggingTarget {
  /**
   * Activate the given log levels.
   * 
   * @param level The log levels to activate.
   */
  activateLogLevel(levels: LogLevel[]): LoggingService;

  /**
   * Activates the given logging target.
   * 
   * @param loggingTarget The logging target to activate.
   */
  activateLoggingTarget(target: LoggingTarget): LoggingService;

  /**
   * Creates a child logger with the given name.
   * 
   * @param name The name of the child logger.
   */
  createChildLogger(name: string): LoggingService;
};
