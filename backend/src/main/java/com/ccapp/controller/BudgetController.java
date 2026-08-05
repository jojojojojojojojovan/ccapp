package com.ccapp.controller;

import com.ccapp.dto.BudgetRequest;
import com.ccapp.dto.BudgetResponse;
import com.ccapp.security.UserDetailsImpl;
import com.ccapp.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BudgetController {

    private final BudgetService budgetService;

    // POST /api/budgets
    @PostMapping
    public ResponseEntity<?> createOrUpdateBudget(
        Authentication authentication,
        @Valid @RequestBody BudgetRequest request) {

        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        Long userId = userDetails.getId();
        BudgetResponse response = budgetService.saveOrUpdateBudget(userId, request);
        return ResponseEntity.ok(response);
    }

    // GET /api/budgets/current?monthYear=2026-08
    @GetMapping("/current")
    public ResponseEntity<?> getBudget(
        Authentication authentication,
        @RequestParam String monthYear) {

        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        Long userId = userDetails.getId();
        BudgetResponse response = budgetService.getBudgetForMonth(userId, monthYear);

        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }
}