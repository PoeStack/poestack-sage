package com.poestack.sage.tactics.image_gen

import io.github.cdimascio.dotenv.Dotenv
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.util.*
import io.ktor.http.ContentType
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import kotlinx.serialization.json.Json
import javax.imageio.ImageIO

fun main(args: Array<String>) {
  embeddedServer(Netty, port = 8081) { extracted() }.start(wait = true)
}

private fun Application.extracted() {
  install(ContentNegotiation) {
    json(
        Json {
          prettyPrint = true
          isLenient = true
        }
    )
  }

  routing {
    get("/api/tactics/v1/image-gen") {
      val img = BufferedImage(200, 200, BufferedImage.TYPE_INT_ARGB)
      val g = img.createGraphics()
      g.drawString("heloooooo", 50, 50)

      val byteArrayOutputStream = ByteArrayOutputStream()
      ImageIO.write(img, "png", byteArrayOutputStream)
      val byteArray = byteArrayOutputStream.toByteArray()

      call.respond(byteArray)
    }
  }
}
