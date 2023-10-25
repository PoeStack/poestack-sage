rootProject.name = "poestack-sage"

include(
    "poe-api",
    "poe-test-env",
    "poestack-cdk",
    "poestack-echo",
    "poestack-echo-common",
    "poestack-insights",
    "poestack-insights-api",
    "poestack-ts-ratchet"
)

File("poestack-echo-plugins").listFiles()!!.forEach {
    include("poestack-echo-plugins:${it.name}")
}
