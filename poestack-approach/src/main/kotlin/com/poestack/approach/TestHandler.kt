package com.poestack.approach

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import redis.clients.jedis.JedisPooled

class TestHandler : RequestHandler<Unit, String> {
    override fun handleRequest(input: Unit, context: Context): String {
        val pool =
            JedisPooled("redis://ps-stream-cache-2.lgibek.clustercfg.memorydb.us-east-1.amazonaws.com:6379")

        pool.set("testkey", "asdasdas")
        val x = pool.get("testkey");
        println("Working")
        return x
    }
}
