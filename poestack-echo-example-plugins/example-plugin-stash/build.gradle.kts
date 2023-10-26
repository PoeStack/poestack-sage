task<Exec>("npmInstall") {
    commandLine("npm", "install")
}

task<Exec>("npmBuild") {
    commandLine("npm", "run", "build")
}