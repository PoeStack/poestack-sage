import { Express, Request, Response } from "express";
import { client, db } from "../services/db";
import { verifyAuth } from "./auth-handler";
import { schema } from "sage-pg-db";
import { uuid } from "uuidv4";
import { notifications } from "sage-pg-db/dist/cjs/scheme";
import { gt, gte, and, eq } from "drizzle-orm";


type Notification = {
  type: string,
  targetId: string,
  body: any
}

export function setupNotificationApi(app: Express) {
  app.post("/notifications", (req: Request, res: Response) => {
    const userId = verifyAuth(req).profile.uuid;
    const notification: Notification = req.body;

    console.log("adding notification", notification);

    db.insert(schema.notifications).values({
      id: uuid().toString(),
      type: notification.type,
      targetId: notification.targetId,
      senderId: userId,
      body: JSON.stringify(notification.body)
    }).then((e) => {
      res.send(200)
    })
  });


  app.get("/notifications/:startTimestampMs", (req: Request, res: Response) => {
    const userId = verifyAuth(req).profile.uuid;
    const startTimestampMs = parseInt(req.params.startTimestampMs);

    db.query.notifications.findMany({
      where: (notifications, { gte, and, eq }) => and(
        gte(notifications.timestamp, new Date(startTimestampMs)),
        eq(notifications.targetId, userId)
      )
    }).then((results) => {
      res.send({ notifications: results })
    })
  });
}
