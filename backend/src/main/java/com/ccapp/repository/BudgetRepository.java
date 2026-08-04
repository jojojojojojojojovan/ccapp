package com.ccapp.repository;

import com.ccapp.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    // Find an existing budget for a specific user and month (e.g. "2026-08")
    Optional<Budget> findByUserIdAndMonthYear(Long userId, String monthYear);
}