package com.ccapp.service;

import com.ccapp.dto.BudgetRequest;
import com.ccapp.dto.BudgetResponse;
import com.ccapp.entity.Budget;
import com.ccapp.entity.User;
import com.ccapp.repository.BudgetRepository;
import com.ccapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    public BudgetResponse saveOrUpdateBudget(Long userId, BudgetRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Check if budget for this month already exists
        Optional<Budget> existingBudget = budgetRepository.findByUserIdAndMonthYear(userId, request.getMonthYear());

        Budget budget;
        if (existingBudget.isPresent()) {
            // Update existing budget amount
            budget = existingBudget.get();
            budget.setAmount(request.getAmount());
        } else {
            // Create a new budget
            budget = new Budget();
            budget.setUser(user);
            budget.setAmount(request.getAmount());
            budget.setMonthYear(request.getMonthYear());
        }

        Budget saved = budgetRepository.save(budget);

        return new BudgetResponse(
            saved.getId(),
            saved.getAmount(),
            saved.getMonthYear(),
            saved.getUpdatedAt()
        );
    }

    public BudgetResponse getBudgetForMonth(Long userId, String monthYear) {
        return budgetRepository.findByUserIdAndMonthYear(userId, monthYear)
            .map(b -> new BudgetResponse(b.getId(), b.getAmount(), b.getMonthYear(), b.getUpdatedAt()))
            .orElse(null); // Returns null or 404 if no budget is set for that month
    }
}