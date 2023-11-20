import { DiscordService } from '../services/discord-service'
import { PoeStackUser } from './poeStackuser'

declare module 'fastify' {
  interface FastifyRequest {
    poeStackUser: PoeStackUser
  }
  interface FastifyInstance {
    discordService?: DiscordService
  }
}
