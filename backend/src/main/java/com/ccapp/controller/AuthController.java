package com.ccapp.controller;

import com.ccapp.entity.Role;
import com.ccapp.entity.User;
import com.ccapp.security.UserDetailsImpl;
import com.ccapp.repository.RoleRepository;
import com.ccapp.repository.UserRepository;
import com.ccapp.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.get("email"),
                loginRequest.get("password")
            )
        );
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        String jwt = jwtUtils.generateToken(authentication);
        String role = userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .findFirst().orElse("ROLE_USER");
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("name", userDetails.getName()); // Changed key name for clarity
        response.put("role", role);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> signUpRequest) {
        String name = signUpRequest.get("name");
        String email = signUpRequest.get("email");
        String password = signUpRequest.get("password");

        // 1. Validation: Check if email is already taken
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Error: Email is already in use!"));
        }

        // 2. Create new user entity
        User user = new User();
        user.setName(name);
        user.setEmail(email);

        // CRITICAL: Hash password with BCrypt before saving to DB
        user.setPassword(passwordEncoder.encode(password));

        // 3. Assign default role (e.g. ROLE_USER)
        Role userRole = roleRepository.findByName("ROLE_USER")
            .orElseThrow(() -> new RuntimeException("Error: Default role 'ROLE_USER' not found in database."));
        user.setRole(userRole);

        // 4. Save to database
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }
}
