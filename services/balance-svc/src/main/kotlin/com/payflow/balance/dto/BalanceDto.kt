
package com.payflow.balance.dto

import java.math.BigDecimal
import java.util.*

data class BalanceRequest(
    val amount: BigDecimal,
    val description: String? = null,
    val transactionId: UUID? = null
)

data class BalanceResponse(
    val userId: String,
    val currentBalance: BigDecimal,
    val availableBalance: BigDecimal,
    val reservedBalance: BigDecimal,
    val currency: String
)

data class TransferRequest(
    val fromUserId: String,
    val toUserId: String,
    val amount: BigDecimal,
    val description: String? = null,
    val transactionId: UUID? = null
)
