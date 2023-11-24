import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'

import { SAGE_BACKEND_PORT, SAGE_FRONTEND_URL } from './env'
import { discordRoutes } from './routes/discord'

const sageBackendServer = Fastify({
  logger: true
})

sageBackendServer.register(helmet)

sageBackendServer.register(cors, {
  origin: "*"
})

sageBackendServer.register(discordRoutes)

const start = async () => {
  try {
    await sageBackendServer.listen({ port: SAGE_BACKEND_PORT })
  } catch (err) {
    sageBackendServer.log.error(err)
    process.exit(1)
  }
}
start()
