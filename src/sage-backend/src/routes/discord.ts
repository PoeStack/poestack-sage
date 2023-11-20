import { identifyUser } from '../middleware/identityMiddleware'
import { DiscordService } from '../services/discord-service'
import { FastifyInstance } from 'fastify'

export async function discordRoutes(sageBackend: FastifyInstance) {
  sageBackend.addHook('preHandler', identifyUser)
  sageBackend.decorate('discordService', new DiscordService())
  sageBackend.post('/send-message', async (request, reply) => {
    const userId = request.poeStackUser?.poeProfileName
    if (!userId) {
      return reply.code(400).type('application/json').send({})
    }
    const messageId = await sageBackend.discordService?.sendMessageToCurrentUser(userId, 'test')
    return reply.type('application/json').send({ messageId })
  })
}
