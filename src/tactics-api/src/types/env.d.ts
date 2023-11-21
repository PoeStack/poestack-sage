declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SAGE_BACKEND_PORT: string
      SAGE_BACKEND_URL: string
      SAFE_FRONTEND_URL: string
      DISCORD_CLIENT_ID: string
      DISCORD_CLIENT_SECRET: string
    }
  }
}

export {}
