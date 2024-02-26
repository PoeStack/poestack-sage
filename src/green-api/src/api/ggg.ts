import { Express, Request, Response } from "express";
import { verifyAuth } from "./auth-handler";
import { GggApi } from "../utils/ggg-api";
import { GggHttpUtil, RateLimitError } from "../utils/ggg-api-util";
import { db } from "../services/db";
import { schema } from "sage-pg-db";

export const gggApiUtil = new GggApi(new GggHttpUtil())

export function setUpGGGProxy(app: Express) {
  function handleError(res: Response) {
    return (err: any) => {
      if (err instanceof RateLimitError) {
        res.status(429)
      } else {
        res.status(500)
      }

      res.send(err)
    }
  }

  app.get("/leagues", (req: Request, res: Response) => {
    const gggToken = verifyAuth(req).oAuthToken
    gggApiUtil.getLeagues(gggToken).subscribe({
      error: handleError,
      next(value) {
        res.send(value)
      },
    })
  });

  app.get("/characters", (req: Request, res: Response) => {
    const user = verifyAuth(req)
    gggApiUtil.getCharacters(user.oAuthToken)
      .subscribe({
        error: handleError,
        next(value) {
          db.insert(schema.poeAccounts).values(
            value.map((c) => ({
              id: c.id!!,
              poeProfileId: user.profile.uuid,
              league: c.league,
              name: c.name,
              class: c.class,
              level: c.level,
              realm: c.realm,
              experience: 0
            }))
          ).onConflictDoNothing().then((e) => {
            console.log("updated characters")
          })

          res.send(value);
        },
      })
  });

  app.get("/stashes/:league", (req: Request, res: Response) => {
    const gggToken = verifyAuth(req).oAuthToken
    const league = req.params.league
    gggApiUtil.getStashes(gggToken, league).subscribe({
      error: handleError,
      next(value) {
        res.send(value)
      },
    })
  });

  app.get("/stash/:league/:stashId", (req: Request, res: Response, next) => {
    const gggToken = verifyAuth(req).oAuthToken
    const league = req.params.league
    const stashId = req.params.stashId
    gggApiUtil.getStashContent(gggToken, league, stashId).subscribe({
      error: handleError,
      next(value) {
        res.send(value)
      },
    })
  })
}
