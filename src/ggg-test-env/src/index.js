const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const port = 3000

app.get('*', (req, res) => {
  const paths = ['poe-api-data', ...req.path.split('/').filter((e) => e.length > 0)]
  const target = path.resolve(...paths) + '.json'
  console.log('paths', target)
  const body = fs.readFileSync(target).toString()
  res.send(body)
})

app.listen(port, () => {
  console.log(`poe-api-test server running on port ${port}`)
})
