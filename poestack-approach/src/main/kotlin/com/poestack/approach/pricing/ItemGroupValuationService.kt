package com.poestack.approach.pricing

import redis.clients.jedis.JedisPooled

class ItemGroupValuationService(private val redis: JedisPooled) {

    fun findValuation(league: String, itemGroupHash: String): ItemGroupValuation {
        val psEntries = redis.hgetAll("psEntries:${league}:${itemGroupHash}");

        var chaosV = 0.0;
        for (psEntry in psEntries.values) {
            val split = psEntry.split(',')
            val timestamp = split[0].toLong() * 1000 * 60;
            val stackSize = split[1].toInt()
            val value = split[2].toDouble();
            val currencyType = split[3];

            if (currencyType.contains("chaos")) {
                chaosV += value;
            }
        }

        if (psEntries.isEmpty()) {
            return ItemGroupValuation(0.0)
        }

        return ItemGroupValuation(chaosV / psEntries.values.size)
    }

    fun search(search: ItemGroupValuationSearch): ItemGroupValuationSearchResponse {
        return ItemGroupValuationSearchResponse(emptyMap())
    }
}