package com.poestack.approach.pricing

import kotlinx.serialization.Serializable

@Serializable
data class ItemGroupValuationSearchResponse(val result: Map<String, ItemGroupValuation>)
