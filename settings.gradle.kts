rootProject.name = "poestack-sage"

include(
  "src:ts-ratchet",
  "src:ggg-api",
  "src:echo-common",
  "src:echo-app",
  "src:echo-app",
  "src:insights",
  "src:insights-cache-updater",
  "src:ggg-test-env",
  "src:sage-aws-cdk",
  "src:sage-docs",
  "src:sage-common",
  "src:tactics-image-gen",
  "src:sage-frontend-tooling",
  "src:tactics-api"
)

File("src/echo-plugin-examples").listFiles()?.forEach {
  include("src:echo-plugin-examples:${it.name}")
}

