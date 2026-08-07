package com.ccapp.repository;

import com.ccapp.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    // Find all accounts for a specific user and month
    List<Account> findByUserIdAndMonthYear(Long userId, String monthYear);

    // Optional: Find only active/included accounts for budget calculations
    List<Account> findByUserIdAndMonthYearAndIncludeTrue(Long userId, String monthYear);
}