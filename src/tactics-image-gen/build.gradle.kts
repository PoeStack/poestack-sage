plugins {
    kotlin("jvm") version "1.9.0"
    kotlin("plugin.serialization").version("1.9.10")
    id("com.github.johnrengelman.shadow").version("8.1.1")
    application
}

group = "com.poestack.sage.tatics.image-gen"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    implementation("io.ktor:ktor-server-core:2.3.5")
    implementation("io.ktor:ktor-server-netty:2.3.5")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.5")
    implementation("io.ktor:ktor-server-content-negotiation:2.3.5")

    implementation("com.amazonaws:aws-lambda-java-core:1.2.0")

    implementation("redis.clients:jedis:5.0.0")
    implementation("io.github.cdimascio:dotenv-kotlin:6.4.1")
    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(11)
}

application {
    mainClass.set("com.poestack.sage.tactics.image_gen.MainKt")
}
