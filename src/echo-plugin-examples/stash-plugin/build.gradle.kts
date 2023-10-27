task<Exec>("npmInstall") {
    commandLine("npm", "install")
}

task<Exec>("npmClean") {
    commandLine("npx", "rimraf", "dist")
}

task<Exec>("npmCleanModules") {
    commandLine("npx", "rimraf", "node_modules")
}

task<Exec>("npmBuild") {
    commandLine("npm", "run", "build")
}