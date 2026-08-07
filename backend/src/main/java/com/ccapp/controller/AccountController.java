package com.ccapp.controller;

import com.ccapp.dto.AccountRequest;
import com.ccapp.dto.AccountResponse;
import com.ccapp.security.UserDetailsImpl;
import com.ccapp.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AccountController {

    private final AccountService accountService;

    // GET /api/accounts?monthYear=2026-08
    @GetMapping
    public ResponseEntity<?> getAccountsByMonth(
        Authentication authentication,
        @RequestParam String monthYear) {

        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        Long userId = userDetails.getId();
        List<AccountResponse> accounts = accountService.getAccountsByUserAndMonth(userId, monthYear);
        return ResponseEntity.ok(accounts);
    }

    // POST /api/accounts
    @PostMapping
    public ResponseEntity<?> createAccount(
        Authentication authentication,
        @Valid @RequestBody AccountRequest request) {

        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        Long userId = userDetails.getId();
        AccountResponse response = accountService.createAccount(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // PUT /api/accounts/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAccount(
        Authentication authentication,
        @PathVariable Long id,
        @Valid @RequestBody AccountRequest request) {

        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        Long userId = userDetails.getId();
        AccountResponse response = accountService.updateAccount(userId, id, request);
        return ResponseEntity.ok(response);
    }

    // DELETE /api/accounts/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(
        Authentication authentication,
        @PathVariable Long id) {

        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized access");
        }

        Long userId = userDetails.getId();
        accountService.deleteAccount(userId, id);
        return ResponseEntity.noContent().build();
    }
}