import express from 'express'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import cors from 'cors'

const EXPRESS_PORT = 8000
const ALLOWED_ORIGINS = ['http://localhost:3000', 'https://poestack.com']

export const createLocalServer = (messageSender: (token: string) => void) => {
  const expressServer = express()
  expressServer.use(
    cors({
      origin: function (origin, callback) {
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true)
        if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
          var msg =
            'The CORS policy for this site does not ' + 'allow access from the specified Origin.'
          return callback(new Error(msg), false)
        }
        return callback(null, true)
      }
    })
  )
  expressServer.use(bodyParser.json())
  expressServer.post('/auth', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    const jwtToken = req.body.token
    if (!jwtToken) {
      return res.status(400).send()
    }
    const decoded = jwt.decode(jwtToken)
    const oAuthCode = decoded?.['oAuthToken']
    if (!oAuthCode) {
      return res.status(400).send()
    }
    messageSender(jwtToken)
    return res.status(201).send()
  })
  return expressServer.listen(EXPRESS_PORT)
}
