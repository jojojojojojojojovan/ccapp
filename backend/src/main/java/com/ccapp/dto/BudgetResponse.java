package com.ccapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private BigDecimal amount;
    private String monthYear;
    private LocalDateTime updatedAt;
}