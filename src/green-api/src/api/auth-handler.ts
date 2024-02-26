import fetch from "node-fetch";
import jwt from "jsonwebtoken"
import { Express, Request, Response } from "express";
import { db } from "../services/db";
import { toArray, filter, from, mergeMap, of, forkJoin } from "rxjs";
import { gggApiUtil } from "./ggg";
import { TFT_ROLES } from "../utils/tft-roles";
import { schema } from "sage-pg-db";

export function verifyAuth(req: Request) {
  const secret = process.env["JWT_SECRET"] as string
  const token = req.headers['authorization']?.replace("Bearer ", "") ?? ""
  var decoded = jwt.verify(token, secret);
  return decoded as { profile: { uuid: string, name: string }, oAuthToken: string }
}

export function setUpGGGAuth(app: Express) {
  app.get("/ggg/auth/:code", async (req: Request, res: Response) => {
    const code = req.params.code

    const url = `https://www.pathofexile.com/oauth/token`;
    const scopes: string[] = [
      "account:profile",
      "account:stashes",
      "account:characters",
      "account:leagues",
      "account:league_accounts",
    ];
    const params = new URLSearchParams();
    params.append("client_id", "poestack");
    params.append("client_secret", process.env.GGG_CLIENT_SECRET!!);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "https://poestack.com/ggg/connected");
    params.append("scope", scopes.join(" "));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent": "OAuth poestack/3.0.0 (contact: zgherridge@gmail.com)",
      },
      body: params,
    });

    const data = await response.json();
    const accessToken = data?.access_token!!

    console.log("got access token", accessToken)
    gggApiUtil.getProfile(accessToken).subscribe((profile) => {
      const jwtString = jwt.sign({
        oAuthToken: accessToken,
        profile: profile
      }, process.env["JWT_SECRET"] as string)

      db.insert(schema.poeProfiles).values({
        id: profile.uuid!!,
        token: accessToken,
        name: profile.name,
      }).onConflictDoNothing().then(() => {
        console.log("updated poe profile")
      })

      res.send({ jwt: jwtString })
    })
  });
}

export function setUpProfile(app: Express) {
  app.get("/my/profile", async (req: Request, res: Response, next) => {
    const jwtIn = verifyAuth(req)

    forkJoin({
      discord: db.query.discordAccounts.findFirst({
        where: (f, o) => o.eq(f.poeAccountId, jwtIn.profile.uuid),
      })
    }).subscribe((e) => {
      res.send({
        ...e,
        profile: jwtIn.profile
      })
    })
  });
}

export function setupDiscordAuth(app: Express) {
  app.get("/discord/auth/:code", async (req: Request, res: Response, next) => {
    try {

      const jwtIn = verifyAuth(req)

      const code = req.params.code

      console.log("sending discord req", jwtIn, code)

      const codeExchangeResp = await fetch(
        "https://discord.com/api/v10/oauth2/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: "1201653656038940672",
            client_secret: process.env.DISCORD_CLIENT_SECRET!!,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: "https://bulk.poestack.com/discord/connect",
          }),
        }
      );
      const authCodeJson = await codeExchangeResp.json();
      console.log('discord auth resp', codeExchangeResp, authCodeJson)

      const userMeResp = await fetch("https://discord.com/api/users/@me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authCodeJson.access_token}`,
        },
      });
      const userMeJson = await userMeResp.json();
      console.log("got discodr resp", userMeJson)
      const user = { id: userMeJson?.id, username: userMeJson?.username };

      const guildsResp = await fetch("https://discord.com/api/users/@me/guilds/645607528297922560/member", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authCodeJson.access_token}`,
        },
      });
      const guildsJson = await guildsResp.json();
      const roles: string[] = guildsJson.roles
      const highestTftRole = TFT_ROLES.find((e) => roles.includes(e.id))

      await db.insert(schema.discordAccounts).values({
        id: user.id,
        poeAccountId: jwtIn.profile.uuid,
        name: user.username,
        tftVouchBonus: (highestTftRole?.vouches ?? 0) * 10
      }).onConflictDoNothing()
      res.send(200)
    } catch (err: any) {
      next(err)
    }
  });
}
