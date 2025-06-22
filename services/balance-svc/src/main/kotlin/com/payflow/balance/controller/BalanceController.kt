
package com.payflow.balance.controller

import com.payflow.balance.dto.BalanceRequest
import com.payflow.balance.dto.BalanceResponse
import com.payflow.balance.dto.TransferRequest
import com.payflow.balance.service.BalanceService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api/v1/balance")
class BalanceController(
    private val balanceService: BalanceService
) {
    
    @GetMapping("/{userId}")
    fun getBalance(@PathVariable userId: String): ResponseEntity<BalanceResponse> {
        val balance = balanceService.getBalance(userId)
        return ResponseEntity.ok(balance)
    }
    
    @PostMapping("/{userId}/credit")
    fun creditBalance(
        @PathVariable userId: String,
        @RequestBody request: BalanceRequest
    ): ResponseEntity<BalanceResponse> {
        val balance = balanceService.creditBalance(
            userId = userId,
            amount = request.amount,
            description = request.description,
            transactionId = request.transactionId
        )
        return ResponseEntity.ok(balance)
    }
    
    @PostMapping("/{userId}/debit")
    fun debitBalance(
        @PathVariable userId: String,
        @RequestBody request: BalanceRequest
    ): ResponseEntity<BalanceResponse> {
        val balance = balanceService.debitBalance(
            userId = userId,
            amount = request.amount,
            description = request.description,
            transactionId = request.transactionId
        )
        return ResponseEntity.ok(balance)
    }
    
    @PostMapping("/{userId}/reserve")
    fun reserveBalance(
        @PathVariable userId: String,
        @RequestBody request: BalanceRequest
    ): ResponseEntity<BalanceResponse> {
        val balance = balanceService.reserveBalance(
            userId = userId,
            amount = request.amount,
            description = request.description,
            transactionId = request.transactionId
        )
        return ResponseEntity.ok(balance)
    }
    
    @PostMapping("/{userId}/release")
    fun releaseReservedBalance(
        @PathVariable userId: String,
        @RequestBody request: BalanceRequest
    ): ResponseEntity<BalanceResponse> {
        val balance = balanceService.releaseReservedBalance(
            userId = userId,
            amount = request.amount,
            description = request.description,
            transactionId = request.transactionId
        )
        return ResponseEntity.ok(balance)
    }
    
    @GetMapping("/health")
    fun health(): ResponseEntity<Map<String, String>> {
        return ResponseEntity.ok(mapOf("status" to "ok", "service" to "balance-service"))
    }
}
