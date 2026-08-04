package com.ccapp.controller;

import com.ccapp.dto.BudgetRequest;
import com.ccapp.dto.BudgetResponse;
import com.ccapp.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // Adjust to match your React port
public class BudgetController {

    private final BudgetService budgetService;

    // POST /api/budgets?userId=1
    @PostMapping
    public ResponseEntity<BudgetResponse> createOrUpdateBudget(
        @RequestParam Long userId,
        @Valid @RequestBody BudgetRequest request) {

        BudgetResponse response = budgetService.saveOrUpdateBudget(userId, request);
        return ResponseEntity.ok(response);
    }

    // GET /api/budgets/current?userId=1&monthYear=2026-08
    @GetMapping("/current")
    public ResponseEntity<BudgetResponse> getBudget(
        @RequestParam Long userId,
        @RequestParam String monthYear) {

        BudgetResponse response = budgetService.getBudgetForMonth(userId, monthYear);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }
}