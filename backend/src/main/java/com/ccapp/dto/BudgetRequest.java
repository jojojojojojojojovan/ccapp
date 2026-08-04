package com.ccapp.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BudgetRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Budget amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Month and year are required")
    private String monthYear; // Format: "YYYY-MM" (e.g. "2026-08")
}