package com.ccapp.controller;

import com.ccapp.dto.ExpenseRequest;
import com.ccapp.dto.ExpenseResponse;
import com.ccapp.security.UserDetailsImpl;
import com.ccapp.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ExpenseController {

    private final ExpenseService expenseService;

    // GET /api/expenses?monthYear=2026-08
    @GetMapping
    public ResponseEntity<?> getExpensesByMonth(
        Authentication authentication,
        @RequestParam String monthYear) {

        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        Long userId = userDetails.getId();
        List<ExpenseResponse> expenses = expenseService.getExpensesByUserAndMonth(userId, monthYear);
        return ResponseEntity.ok(expenses);
    }

    // POST /api/expenses
    @PostMapping
    public ResponseEntity<?> createExpense(
        Authentication authentication,
        @Valid @RequestBody ExpenseRequest request) {

        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        Long userId = userDetails.getId();
        ExpenseResponse response = expenseService.createExpense(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // PUT /api/expenses/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(
        Authentication authentication,
        @PathVariable Long id,
        @Valid @RequestBody ExpenseRequest request) {

        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        Long userId = userDetails.getId();
        ExpenseResponse response = expenseService.updateExpense(userId, id, request);
        return ResponseEntity.ok(response);
    }

    // DELETE /api/expenses/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(
        Authentication authentication,
        @PathVariable Long id) {

        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        Long userId = userDetails.getId();
        expenseService.deleteExpense(userId, id);
        return ResponseEntity.noContent().build();
    }
}