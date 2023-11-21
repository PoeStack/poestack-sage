import { DiscordService } from '../services/discord-service'
import { PoeStackUser } from './poeStackUser'

declare module 'fastify' {
  interface FastifyRequest {
    poeStackUser: PoeStackUser
  }
  interface FastifyInstance {
    discordService?: DiscordService
  }
}
