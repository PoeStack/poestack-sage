buildscript {
  val isWindows = System.getProperty("os.name").lowercase().contains("win");
  if (isWindows) {
    extra.set("npm", "npm.cmd");
    extra.set("npx", "npx.cmd");
  } else {
    extra.set("npm", "npm");
    extra.set("npx", "npx");
  }
}

task("dockerBuildAndPublish") {

  val packageName = "poestack-insightsx"
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
