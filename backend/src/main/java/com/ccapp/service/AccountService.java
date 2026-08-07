package com.ccapp.service;

import com.ccapp.dto.AccountRequest;
import com.ccapp.dto.AccountResponse;
import com.ccapp.entity.Account;
import com.ccapp.entity.User;
import com.ccapp.repository.AccountRepository;
import com.ccapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public List<AccountResponse> getAccountsByUserAndMonth(Long userId, String monthYear) {
        return accountRepository.findByUserIdAndMonthYear(userId, monthYear)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public AccountResponse createAccount(Long userId, AccountRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Account account = new Account();
        account.setUser(user);
        account.setName(request.getName());
        account.setAmount(request.getAmount());
        account.setInitial(request.getInitial());
        account.setMonthYear(request.getMonthYear());
        account.setInclude(request.getInclude());

        Account savedAccount = accountRepository.save(account);
        return mapToResponse(savedAccount);
    }

    public AccountResponse updateAccount(Long userId, Long accountId, AccountRequest request) {
        Account account = getAccountForUser(accountId, userId);

        account.setName(request.getName());
        account.setAmount(request.getAmount());
        account.setInitial(request.getInitial());
        account.setMonthYear(request.getMonthYear());
        account.setInclude(request.getInclude());

        Account updatedAccount = accountRepository.save(account);
        return mapToResponse(updatedAccount);
    }

    public void deleteAccount(Long userId, Long accountId) {
        Account account = getAccountForUser(accountId, userId);
        accountRepository.delete(account);
    }

    private Account getAccountForUser(Long accountId, Long userId) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new RuntimeException("Account not found with id: " + accountId));

        if (!account.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to account");
        }

        return account;
    }

    private AccountResponse mapToResponse(Account account) {
        return AccountResponse.builder()
            .id(account.getId())
            .userId(account.getUser().getId())
            .name(account.getName())
            .amount(account.getAmount())
            .initial(account.getInitial())
            .monthYear(account.getMonthYear())
            .include(account.getInclude())
            .createdAt(account.getCreatedAt())
            .updatedAt(account.getUpdatedAt())
            .build();
    }
}