
package com.payflow.balance.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

@Entity
@Table(name = "balances")
data class Balance(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: UUID = UUID.randomUUID(),
    
    @Column(name = "user_id", nullable = false, unique = true)
    val userId: String,
    
    @Column(name = "current_balance", precision = 15, scale = 2, nullable = false)
    var currentBalance: BigDecimal = BigDecimal.ZERO,
    
    @Column(name = "reserved_balance", precision = 15, scale = 2, nullable = false)
    var reservedBalance: BigDecimal = BigDecimal.ZERO,
    
    @Column(name = "currency", nullable = false)
    val currency: String = "INR",
    
    @Column(name = "is_active", nullable = false)
    var isActive: Boolean = true,
    
    @Column(name = "created_at", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    fun getAvailableBalance(): BigDecimal = currentBalance - reservedBalance
}
