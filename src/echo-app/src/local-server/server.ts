import express from 'express'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'

const EXPRESS_PORT = 8000

export const createLocalServer = (messageSender: (token: string) => void) => {
  const expressServer = express()
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
