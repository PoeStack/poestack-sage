val npm = rootProject.extra.get("npm")
val npx = rootProject.extra.get("npx")

task<Exec>("npmInstall") {
    commandLine(npm, "install")
    dependsOn(":src:echo-app:npmInstall")
}

task<Exec>("npmClean") {
    commandLine(npx, "rimraf", "dist")
}

task<Exec>("npmCleanModules") {
    commandLine(npx, "rimraf", "node_modules")
}

task<Exec>("npmBuild") {
    commandLine(npm, "run", "build")
}

task<Exec>("npmRelease") {
   commandLine(npm, "run", "release")
}

task<Exec>("npmFormat") {
    commandLine(npm, "run", "format")
}

task<Exec>("npmLint") {
    commandLine(npm, "run", "lint")
}