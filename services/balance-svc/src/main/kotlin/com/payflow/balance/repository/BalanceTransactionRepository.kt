
package com.payflow.balance.repository

import com.payflow.balance.model.BalanceTransaction
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface BalanceTransactionRepository : JpaRepository<BalanceTransaction, UUID> {
    
    fun findByUserIdOrderByCreatedAtDesc(userId: String, pageable: Pageable): Page<BalanceTransaction>
    
    fun findByTransactionId(transactionId: UUID): BalanceTransaction?
}
