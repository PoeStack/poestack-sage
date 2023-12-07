import path from "path";
import fs from "fs";

const publicPath = path.resolve("..", "..", "public");
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath);
}

const pluginsJsonPath = path.resolve(publicPath, "plugins.json");
if (!fs.existsSync(pluginsJsonPath)) {
  fs.writeFileSync(pluginsJsonPath, "{}");
}

const examplePluginsDir = path.resolve("..", "echo-plugin-examples");
const pluginsDir = path.resolve("..", "echo-plugins");
const echoCommonVersion = JSON.parse(
  fs.readFileSync(path.resolve("..", "echo-common", "package.json"))
).version;

const manifestPlugins = JSON.parse(fs.readFileSync(pluginsJsonPath));
const examplePlugins = fs.readdirSync(examplePluginsDir);
const plugins = fs.readdirSync(pluginsDir);
examplePlugins.forEach(function (file) {
  const currentPackage = JSON.parse(
    fs.readFileSync(path.resolve(examplePluginsDir, file, "package.json"))
  );
  const lastPlugin = manifestPlugins[currentPackage.name];

  if (lastPlugin?.version !== currentPackage.version) {
    manifestPlugins[currentPackage.name] = {
      name: currentPackage.name,
      version: currentPackage.version,
      echoCommonVersion: echoCommonVersion,
    };
  }
});
plugins.forEach(function (file) {
  const currentPackage = JSON.parse(
    fs.readFileSync(path.resolve(pluginsDir, file, "package.json"))
  );
  const lastPlugin = manifestPlugins[currentPackage.name];

  if (lastPlugin?.version !== currentPackage.version) {
    manifestPlugins[currentPackage.name] = {
      name: currentPackage.name,
      version: currentPackage.version,
      echoCommonVersion: echoCommonVersion,
    };
  }
});

console.log("writing", manifestPlugins);
fs.writeFileSync(pluginsJsonPath, JSON.stringify(manifestPlugins, null, 2));
