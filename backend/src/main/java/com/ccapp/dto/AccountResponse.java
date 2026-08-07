package com.ccapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {

    private Long id;
    private Long userId;
    private String name;
    private BigDecimal amount;
    private BigDecimal initial;
    private String monthYear;
    private Boolean include;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}