task<Exec>("npmInstall") {
    commandLine("npm", "install")
}

task<Exec>("npmClean") {
    commandLine("npx", "rimraf", "build")
}

task<Exec>("npmCleanModules") {
    commandLine("npx", "rimraf", "node_modules")
}

task<Exec>("npmBuild") {
    commandLine("npm", "run", "build")
    dependsOn(":src:echo-common:npmBuild")
}
