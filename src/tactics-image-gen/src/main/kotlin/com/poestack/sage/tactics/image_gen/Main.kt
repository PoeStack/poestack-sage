package com.poestack.sage.tactics.image_gen

import java.awt.image.BufferedImage
import java.io.File
import javax.imageio.ImageIO
import com.poestack.sage.tactics.image_gen.parseLine
import kotlin.math.floor
import kotlin.math.round
import kotlin.math.roundToInt

data class ParsedLine(val img: String, val display: String, val quantity: String, val valuation: String)

fun parseLine(line: String): ParsedLine {
  val splitLine = line.split(",")
  return ParsedLine(
    splitLine[0],
    splitLine[1],
    splitLine[2],
    splitLine[3]
  )
}

fun main(args: Array<String>) {
  val inputFile = args[0]
  val outputFile = args[1]

  val lines = File(inputFile).readLines().map { parseLine(it) }

  val img = BufferedImage(500, 150 + (lines.size / 2 * 60), BufferedImage.TYPE_INT_ARGB)
  val g = img.createGraphics()

  var i = 0
  for(line in lines) {
    val baseY = (floor(i / 2.0) * 60).roundToInt()
    val baseX = if(i % 2 == 0) 0 else 250

    g.drawString(line.display, baseX, baseY)

    i++
  }

  ImageIO.write(img, "png", File(outputFile))
}
