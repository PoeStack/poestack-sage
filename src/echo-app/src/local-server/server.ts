import http from 'http'
import url from 'url'
import jwt from 'jsonwebtoken'

export const createLocalServer = (messageSender: (token: string) => void) => {
  return http.createServer(function (req, res) {
    console.log('starting')
    res.setHeader('Content-Type', 'application/json')
    const reqUrl = req.url && url.parse(req.url).pathname

    if (req.method == 'POST' && reqUrl == '/auth') {
      let requestBody: Buffer[] = []
      req.on('data', (chunks: Buffer) => {
        requestBody.push(chunks)
      })
      req.on('end', () => {
        try {
          const rawData = Buffer.concat(requestBody).toString()
          const parsedData = JSON.parse(rawData)
          const jwtToken = parsedData.token
          if (!jwtToken) {
            res.statusCode = 400
            return res.end()
          }
          const decoded = jwt.decode(jwtToken)
          const oAuthCode = decoded?.['oAuthToken']
          if (oAuthCode) {
            messageSender(jwtToken)
            res.statusCode = 201
            return res.end()
          } else {
            res.statusCode = 400
            return res.end()
          }
        } catch (e) {
          console.log(e)
          res.statusCode = 400
          return res.end()
        }
      })
    }
    res.statusCode = 400
    return res.end()
  })
}
