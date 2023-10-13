package com.poestack.approach

import com.poestack.approach.pricing.ItemGroupValuationSearch
import com.poestack.approach.pricing.ItemGroupValuationService
import io.github.cdimascio.dotenv.Dotenv
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json
import redis.clients.jedis.JedisPooled

fun main(args: Array<String>) {
    val dotenv = Dotenv.load()
    val pool =
        JedisPooled(dotenv.get("REDIS_URL"))

    val itemGroupValuationService = ItemGroupValuationService(pool)

    embeddedServer(Netty, port = 8080) {
        extracted(itemGroupValuationService, pool)
    }.start(wait = true)
}

private fun Application.extracted(
    itemGroupValuationService: ItemGroupValuationService,
    pool: JedisPooled
) {
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
        })
    }

    routing {
        get("/api/approach/item-groups/{league}/valuations") {
            val league = call.parameters["league"]!!
            val itemGroupHash = call.request.queryParameters["itemGroupHash"]!!
            val valuation = itemGroupValuationService.findValuation(league, itemGroupHash)
            call.respond(valuation)
        }
        post("/api/approach/item-groups/{league}/valuations/search") {
            val search = call.receive<ItemGroupValuationSearch>()
            val result = itemGroupValuationService.search(search)
            call.respond(result)
        }
    }
}