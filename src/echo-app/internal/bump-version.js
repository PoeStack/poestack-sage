const nextBuildId = require('next-build-id')
const fs = require('fs')
const { resolve } = require('path')

fs.writeFileSync(
  resolve('..', 'src', 'renderer', 'src', 'version.ts'),
  `export const SAGE_VERSION = "${Date.now()}_${nextBuildId.sync()}"`
)
