package com.poestack.approach

import com.amazonaws.services.lambda.runtime.Context
import com.amazonaws.services.lambda.runtime.RequestHandler
import redis.clients.jedis.HostAndPort
import redis.clients.jedis.JedisCluster
import redis.clients.jedis.JedisPooled


data class Input(var key: String = "")
class TestHandler : RequestHandler<Input, Map<String, String>> {
    override fun handleRequest(input: Input, context: Context): Map<String, String> {
        val pool =
            JedisCluster(HostAndPort("ps-stream-cache-2.lgibek.clustercfg.memorydb.us-east-1.amazonaws.com", 6379))
        val x = pool.hgetAll(input.key)
        println("got $x")
        return x
    }
}
