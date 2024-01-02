import { LoggingService } from "./logging-service";

export type PluginMetadata = {
  name: string
};

export type PluginContext = {
  /**
   * The plugin metadata.
   */
  meta: PluginMetadata;

  /**
   * Services provided by the Echo framework.
   */
  services: {

    /**
     * A plugin scoped logging service.
     */
    loggingService: LoggingService
  }
};
