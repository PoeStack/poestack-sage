task<Exec>("npmInstall") {
    commandLine("npm", "install")
}

task<Exec>("npmBuild") {
    commandLine("npm", "run", "build")
}

task<Exec>("npmClean") {
    commandLine("npx", "rimraf", "dist")
}

task<Exec>("npmCleanModules") {
    commandLine("npx", "rimraf", "node_modules")
}

task("dockerBuildAndPublish") {
    val packageName = "poestack-insights-cache-updater"
    doLast {
        exec {
            commandLine("docker", "build", "-t", packageName, ".")
        }
        exec {
            commandLine(
                "docker",
                "tag",
                "${packageName}:latest",
                "604080725100.dkr.ecr.us-east-1.amazonaws.com/${packageName}:latest"
            )
        }
        exec {
            commandLine("docker", "push", "604080725100.dkr.ecr.us-east-1.amazonaws.com/${packageName}:latest")
        }
    }
}