import { EchoContext } from "./echo-context";

export class EchoContextService {

  public contexts: {[source: string]: EchoContext} = {}

  public context(source: string): EchoContext {
    return this.contexts[source]
  }
}

export const ECHO_CONTEXT_SERVICE = new EchoContextService()
