
package com.payflow.balance.repository

import com.payflow.balance.model.Balance
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.*
import jakarta.persistence.LockModeType

@Repository
interface BalanceRepository : JpaRepository<Balance, UUID> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Balance b WHERE b.userId = :userId")
    fun findByUserIdForUpdate(userId: String): Balance?
    
    fun findByUserId(userId: String): Balance?
    
    @Query("SELECT b FROM Balance b WHERE b.userId IN :userIds")
    fun findByUserIds(userIds: List<String>): List<Balance>
}
