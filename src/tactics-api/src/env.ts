import dotenv from 'dotenv'
dotenv.config()

export const SAGE_BACKEND_PORT = parseInt(process.env.SAGE_BACKEND_PORT) ?? 9000
export const SAGE_BACKEND_URL = process.env.SAGE_BACKEND_URL ?? 'http://localhost:9000'
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? ''
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET ?? ''
export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? ''
export const SAGE_FRONTEND_URL = process.env.SAGE_FRONTEND_URL
