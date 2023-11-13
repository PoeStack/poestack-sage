import http from 'http'
import url from 'url'
import { ipcMain } from 'electron'

export const server = http.createServer(function (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  if (!req.url) {
    res.statusCode = 400
    res.end()
    return
  }
  const reqUrl = url.parse(req.url).pathname
  // Compare our request method
  if (req.method == 'POST' && reqUrl == '/auth') {
    if (reqUrl == '/auth') {
      res.statusCode = 201
      res.end()
      return
    }
  }
  res.statusCode = 400
  res.end()
})
