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

val excludedAppBuildProjects = listOf(
  "src",
  "echo-plugin-examples",
  "echo-plugins",
  "ggg-test-env",
  "insights",
  "insights-cache-updater",
  "sage-aws-cdk",
  "sage-docs",
  "sage-ts-tooling",
  "tactics-api",
  "tactics-image-gen"
)

val appBuildNpmInstall = task("appBuildNpmInstall")
gradle.projectsEvaluated {
  subprojects.filter {
    !excludedAppBuildProjects.contains(it.name)
  }.forEach { appBuildNpmInstall.dependsOn(it.tasks.named("npmInstall")) }
}

val appBuildNpmBuild = task("appBuildNpmBuild")
gradle.projectsEvaluated {
  subprojects.filter {
    !excludedAppBuildProjects.contains(it.name)
  }.forEach { appBuildNpmBuild.dependsOn(it.tasks.named("npmBuild")) }
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
