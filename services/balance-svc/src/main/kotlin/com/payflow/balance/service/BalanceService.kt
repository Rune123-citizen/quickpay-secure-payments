
package com.payflow.balance.service

import com.payflow.balance.model.Balance
import com.payflow.balance.model.BalanceTransaction
import com.payflow.balance.model.TransactionType
import com.payflow.balance.repository.BalanceRepository
import com.payflow.balance.repository.BalanceTransactionRepository
import com.payflow.balance.dto.BalanceRequest
import com.payflow.balance.dto.BalanceResponse
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

@Service
@Transactional
class BalanceService(
    private val balanceRepository: BalanceRepository,
    private val balanceTransactionRepository: BalanceTransactionRepository
) {
    
    fun getBalance(userId: String): BalanceResponse {
        val balance = getOrCreateBalance(userId)
        return BalanceResponse(
            userId = balance.userId,
            currentBalance = balance.currentBalance,
            availableBalance = balance.getAvailableBalance(),
            reservedBalance = balance.reservedBalance,
            currency = balance.currency
        )
    }
    
    fun creditBalance(userId: String, amount: BigDecimal, description: String? = null, transactionId: UUID? = null): BalanceResponse {
        val balance = balanceRepository.findByUserIdForUpdate(userId) ?: createBalance(userId)
        val balanceBefore = balance.currentBalance
        
        balance.currentBalance = balance.currentBalance.add(amount)
        balance.updatedAt = LocalDateTime.now()
        
        val savedBalance = balanceRepository.save(balance)
        
        // Record transaction
        balanceTransactionRepository.save(
            BalanceTransaction(
                userId = userId,
                transactionId = transactionId,
                type = TransactionType.CREDIT,
                amount = amount,
                balanceBefore = balanceBefore,
                balanceAfter = savedBalance.currentBalance,
                description = description
            )
        )
        
        return BalanceResponse(
            userId = savedBalance.userId,
            currentBalance = savedBalance.currentBalance,
            availableBalance = savedBalance.getAvailableBalance(),
            reservedBalance = savedBalance.reservedBalance,
            currency = savedBalance.currency
        )
    }
    
    fun debitBalance(userId: String, amount: BigDecimal, description: String? = null, transactionId: UUID? = null): BalanceResponse {
        val balance = balanceRepository.findByUserIdForUpdate(userId) 
            ?: throw IllegalArgumentException("Balance not found for user: $userId")
        
        if (balance.getAvailableBalance() < amount) {
            throw IllegalArgumentException("Insufficient balance")
        }
        
        val balanceBefore = balance.currentBalance
        balance.currentBalance = balance.currentBalance.subtract(amount)
        balance.updatedAt = LocalDateTime.now()
        
        val savedBalance = balanceRepository.save(balance)
        
        // Record transaction
        balanceTransactionRepository.save(
            BalanceTransaction(
                userId = userId,
                transactionId = transactionId,
                type = TransactionType.DEBIT,
                amount = amount,
                balanceBefore = balanceBefore,
                balanceAfter = savedBalance.currentBalance,
                description = description
            )
        )
        
        return BalanceResponse(
            userId = savedBalance.userId,
            currentBalance = savedBalance.currentBalance,
            availableBalance = savedBalance.getAvailableBalance(),
            reservedBalance = savedBalance.reservedBalance,
            currency = savedBalance.currency
        )
    }
    
    fun reserveBalance(userId: String, amount: BigDecimal, description: String? = null, transactionId: UUID? = null): BalanceResponse {
        val balance = balanceRepository.findByUserIdForUpdate(userId)
            ?: throw IllegalArgumentException("Balance not found for user: $userId")
        
        if (balance.getAvailableBalance() < amount) {
            throw IllegalArgumentException("Insufficient available balance")
        }
        
        balance.reservedBalance = balance.reservedBalance.add(amount)
        balance.updatedAt = LocalDateTime.now()
        
        val savedBalance = balanceRepository.save(balance)
        
        // Record transaction
        balanceTransactionRepository.save(
            BalanceTransaction(
                userId = userId,
                transactionId = transactionId,
                type = TransactionType.RESERVE,
                amount = amount,
                balanceBefore = savedBalance.currentBalance,
                balanceAfter = savedBalance.currentBalance,
                description = description
            )
        )
        
        return BalanceResponse(
            userId = savedBalance.userId,
            currentBalance = savedBalance.currentBalance,
            availableBalance = savedBalance.getAvailableBalance(),
            reservedBalance = savedBalance.reservedBalance,
            currency = savedBalance.currency
        )
    }
    
    fun releaseReservedBalance(userId: String, amount: BigDecimal, description: String? = null, transactionId: UUID? = null): BalanceResponse {
        val balance = balanceRepository.findByUserIdForUpdate(userId)
            ?: throw IllegalArgumentException("Balance not found for user: $userId")
        
        if (balance.reservedBalance < amount) {
            throw IllegalArgumentException("Insufficient reserved balance")
        }
        
        balance.reservedBalance = balance.reservedBalance.subtract(amount)
        balance.updatedAt = LocalDateTime.now()
        
        val savedBalance = balanceRepository.save(balance)
        
        // Record transaction
        balanceTransactionRepository.save(
            BalanceTransaction(
                userId = userId,
                transactionId = transactionId,
                type = TransactionType.RELEASE,
                amount = amount,
                balanceBefore = savedBalance.currentBalance,
                balanceAfter = savedBalance.currentBalance,
                description = description
            )
        )
        
        return BalanceResponse(
            userId = savedBalance.userId,
            currentBalance = savedBalance.currentBalance,
            availableBalance = savedBalance.getAvailableBalance(),
            reservedBalance = savedBalance.reservedBalance,
            currency = savedBalance.currency
        )
    }
    
    private fun getOrCreateBalance(userId: String): Balance {
        return balanceRepository.findByUserId(userId) ?: createBalance(userId)
    }
    
    private fun createBalance(userId: String): Balance {
        val balance = Balance(userId = userId)
        return balanceRepository.save(balance)
    }
}
