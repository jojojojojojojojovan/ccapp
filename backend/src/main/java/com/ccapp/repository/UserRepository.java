package com.ccapp.repository;

import com.ccapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Used by Spring Security UserDetailsService during login
    Optional<User> findByEmail(String email);

    // Useful for checking if an email is already registered
    Boolean existsByEmail(String email);
}