import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { scanKeys } from "./utils";
import { setUpGGGAuth, setupDiscordAuth, verifyAuth } from "./api/auth-handler";
import { setUpGGGProxy } from "./api/ggg";
import { setupListingApi } from "./api/listing";
import { setupNotificationApi } from "./api/notifications";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method'] ?? "*");
  res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] ?? "*");
  res.header('Access-Control-Allow-Origin', req.headers.origin ?? "*");

  var oneof = false;
  if (req.headers.origin) {
    oneof = true;
  }
  if (req.headers['access-control-request-method']) {
    oneof = true;
  }
  if (req.headers['access-control-request-headers']) {
    oneof = true;
  }

  if (oneof && req.method == 'OPTIONS') {
    console.log("options good")
    res.send(200);
  }
  else {
    next();
  }
});

app.use(express.json())

app.use((err: any, req: any, res: any, next: any) => {
  res.status(500).send('Something broke!')
})


setupDiscordAuth(app)
setUpGGGAuth(app)
setupNotificationApi(app)
setUpGGGProxy(app)
setupListingApi(app)

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port} v1.0`);
});
