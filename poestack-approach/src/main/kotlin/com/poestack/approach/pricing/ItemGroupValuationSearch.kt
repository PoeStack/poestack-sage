package com.poestack.approach.pricing

import kotlinx.serialization.Serializable

@Serializable
data class ItemGroupValuationSearch(val itemGroupHashes: Collection<String>)
