import { identifyUser } from '../middleware/identityMiddleware'
import { DiscordService } from '../services/discord-service'
import { FastifyInstance } from 'fastify'

export async function discordRoutes(sageBackend: FastifyInstance) {
  sageBackend.addHook('preHandler', identifyUser)
  sageBackend.decorate('discordService', new DiscordService())
  sageBackend.post<{ Body: { message: string } }>('/send-message', {
    handler: async (request, reply) => {
      const userId = request.poeStackUser?.discordUserId
      if (!userId) {
        return reply.code(400).type('application/json').send({})
      }
      const messageId = await sageBackend.discordService?.sendMessageToCurrentUser(
        userId,
        request.body.message
      )
      return reply.type('application/json').send({ messageId })
    },
    schema: {
      body: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      },
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string', pattern: '^(Bearer) (.*)' }
        }
      }
    }
  })
}
