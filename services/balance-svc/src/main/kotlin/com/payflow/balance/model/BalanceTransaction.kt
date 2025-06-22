
package com.payflow.balance.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "balance_transactions")
data class BalanceTransaction(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: UUID = UUID.randomUUID(),
    
    @Column(name = "user_id", nullable = false)
    val userId: String,
    
    @Column(name = "transaction_id")
    val transactionId: UUID? = null,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    val type: TransactionType,
    
    @Column(name = "amount", precision = 15, scale = 2, nullable = false)
    val amount: BigDecimal,
    
    @Column(name = "balance_before", precision = 15, scale = 2, nullable = false)
    val balanceBefore: BigDecimal,
    
    @Column(name = "balance_after", precision = 15, scale = 2, nullable = false)
    val balanceAfter: BigDecimal,
    
    @Column(name = "description")
    val description: String? = null,
    
    @Column(name = "metadata", columnDefinition = "TEXT")
    val metadata: String? = null,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)

enum class TransactionType {
    CREDIT, DEBIT, RESERVE, RELEASE
}
