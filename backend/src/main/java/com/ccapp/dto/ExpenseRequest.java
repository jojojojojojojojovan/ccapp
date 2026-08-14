package com.ccapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseRequest {

    @NotBlank(message = "Expense name is required")
    private String name;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    @NotBlank(message = "Month-year is required")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "Format must be YYYY-MM")
    private String monthYear;

    @NotNull(message = "Include flag is required")
    private Boolean include;
}