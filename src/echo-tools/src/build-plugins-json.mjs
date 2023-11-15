import path from 'path'
import fs from "fs"

const publicPath = path.resolve("..", "..", "public")
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath)
}

const pluginsJsonPath = path.resolve(publicPath, "plugins.json")
if (!fs.existsSync(pluginsJsonPath)) {
  fs.writeFileSync(pluginsJsonPath, "{}")
}

const baseDir = path.resolve("..", "echo-plugin-examples")
const echoCommonVersion = JSON.parse(fs.readFileSync(path.resolve("..", "echo-common", "package.json"))).version

const plugins = JSON.parse(fs.readFileSync(pluginsJsonPath))
const files = fs.readdirSync(baseDir)
files.forEach(function(file) {
  const currentPackage = JSON.parse(fs.readFileSync(path.resolve(baseDir, file, "package.json")))
  console.log("asdasd", currentPackage)
  const lastPlugin = plugins[currentPackage.name]

  if (lastPlugin?.version !== currentPackage.version) {
    plugins[currentPackage.name] = { name: currentPackage.name, version: currentPackage.version, echoCommonVersion: echoCommonVersion }
  }
})

console.log("writing", plugins)
fs.writeFileSync(pluginsJsonPath, JSON.stringify(plugins, null, 2))
