task<Exec>("npmInstall") {
    commandLine("npm", "install")
}

task<Exec>("npmCleanModules") {
    commandLine("npx", "rimraf", "node_modules")
}
