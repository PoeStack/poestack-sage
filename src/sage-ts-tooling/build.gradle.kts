val npm = rootProject.extra.get("npm")
val npx = rootProject.extra.get("npx") 

task<Exec>("npmInstall") {
    commandLine(npm, "install")
}

task<Exec>("npmCleanModules") {
    commandLine(npx, "rimraf", "node_modules")
}
