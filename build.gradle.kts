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

val buildPlugins = task("buildPlugins")
gradle.projectsEvaluated {
  subprojects.filter {
    it.path.contains("echo-plugin-examples:") ||
    it.path.contains("echo-plugins:")
  }.forEach { buildPlugins.dependsOn(it.tasks.named("npmBuild")) }
}

task("dockerBuildAndPublish") {

  val packageName = "poestack-tactics-apix"
  doLast {
    exec {
      commandLine("docker", "build", "--platform=linux/amd64", "--progress=plain", "-t", packageName, ".")
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
