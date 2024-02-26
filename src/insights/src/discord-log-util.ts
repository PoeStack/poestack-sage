import { HttpUtil } from "sage-common"

const webhook = ""


const httpUtil = new HttpUtil()

export function logDiscord(serviceName: string, body: string) {
  return httpUtil.post(webhook, {
    "username": `Sage - ${serviceName}`,
    "avatar_url": "https://poestack.com/_next/image?url=%2Flogo_noname.png&w=96&q=75",
    "content": body
  })
}

