package com.ccapp.service;

import com.ccapp.dto.ExpenseRequest;
import com.ccapp.dto.ExpenseResponse;
import com.ccapp.entity.Expense;
import com.ccapp.entity.User;
import com.ccapp.repository.ExpenseRepository;
import com.ccapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public List<ExpenseResponse> getExpensesByUserAndMonth(Long userId, String monthYear) {
        return expenseRepository.findByUserIdAndMonthYear(userId, monthYear)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public ExpenseResponse createExpense(Long userId, ExpenseRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Expense expense = new Expense();
        expense.setUser(user);
        expense.setName(request.getName());
        expense.setAmount(request.getAmount());
        expense.setMonthYear(request.getMonthYear());
        expense.setInclude(request.getInclude());

        Expense savedExpense = expenseRepository.save(expense);
        return mapToResponse(savedExpense);
    }

    public ExpenseResponse updateExpense(Long userId, Long expenseId, ExpenseRequest request) {
        Expense expense = getExpenseForUser(expenseId, userId);

        expense.setName(request.getName());
        expense.setAmount(request.getAmount());
        expense.setMonthYear(request.getMonthYear());
        expense.setInclude(request.getInclude());

        Expense updatedExpense = expenseRepository.save(expense);
        return mapToResponse(updatedExpense);
    }

    public void deleteExpense(Long userId, Long expenseId) {
        Expense expense = getExpenseForUser(expenseId, userId);
        expenseRepository.delete(expense);
    }

    private Expense getExpenseForUser(Long expenseId, Long userId) {
        Expense expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new RuntimeException("Expense not found with id: " + expenseId));

        if (!expense.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to expense");
        }

        return expense;
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        return ExpenseResponse.builder()
            .id(expense.getId())
            .userId(expense.getUser().getId())
            .name(expense.getName())
            .amount(expense.getAmount())
            .monthYear(expense.getMonthYear())
            .include(expense.getInclude())
            .createdAt(expense.getCreatedAt())
            .updatedAt(expense.getUpdatedAt())
            .build();
    }
}