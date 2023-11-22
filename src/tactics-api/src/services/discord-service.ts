import { API } from '@discordjs/core'
import { REST } from 'discord.js'
import {
  DISCORD_BOT_TOKEN,
  SAGE_BACKEND_URL,
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET
} from '../env'

export class DiscordService {
  private discordApi: API

  constructor() {
    const restApiInstance = new REST({
      version: '10'
    }).setToken(DISCORD_BOT_TOKEN)
    this.discordApi = new API(restApiInstance)
  }

  public async sendMessageToCurrentUser(userId: string, messageContent: string) {
    const messageChannel = await this.discordApi.users.createDM(userId)
    const createMessageResponse = await this.discordApi.channels.createMessage(messageChannel.id, {
      content: messageContent
    })
    return createMessageResponse.id
  }

  public async getUserInfo(userId: string) {
    return await this.discordApi.users.get(userId)
  }

  public async getOAuth2AuthorizeUrl() {
    return this.discordApi.oauth2.generateAuthorizationURL({
      client_id: DISCORD_CLIENT_ID,
      response_type: 'code',
      redirect_uri: `${SAGE_BACKEND_URL}/oauth/callback`,
      scope: 'identify'
    })
  }

  public async getAccessToken(code: string) {
    const tokenResponse = await this.discordApi.oauth2.tokenExchange({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: `${SAGE_BACKEND_URL}/oauth/callback`,
      code
    })
    return tokenResponse.access_token
  }
}
