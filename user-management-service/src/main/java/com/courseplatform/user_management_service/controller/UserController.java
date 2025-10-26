package com.courseplatform.user_management_service.controller;

import com.courseplatform.user_management_service.dto.UserLoginDto;
import com.courseplatform.user_management_service.dto.UserRegistrationDto;
import com.courseplatform.user_management_service.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // ========== PUBLIC ENDPOINTS ==========

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@Valid @RequestBody UserRegistrationDto dto) {
        try {
            Map<String, Object> result = userService.registerUser(dto);

            if ((Boolean) result.get("success")) {
                return ResponseEntity.status(HttpStatus.CREATED).body(result);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@Valid @RequestBody UserLoginDto dto) {
        try {
            Map<String, Object> result = userService.loginUser(dto);

            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ========== INSTRUCTOR ENDPOINTS ==========

    @GetMapping("/instructors")
    public ResponseEntity<Map<String, Object>> getVerifiedInstructors() {
        try {
            Map<String, Object> result = userService.getVerifiedInstructors();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to get instructors: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getUsersByRole(@PathVariable String role) {
        try {
            Map<String, Object> result = userService.getUsersByRole(role);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to get users by role: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ========== ADMIN ENDPOINTS ==========

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPlatformStats() {
        return ResponseEntity.ok(userService.getPlatformStats());
    }

    // ========== UTILITY ENDPOINTS ==========

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @GetMapping("/test-token")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> testToken(HttpServletRequest request) {
        Map<String, Object> tokenInfo = new HashMap<>();
        tokenInfo.put("success", true);
        tokenInfo.put("userId", request.getAttribute("userId"));
        tokenInfo.put("userEmail", request.getAttribute("userEmail"));
        tokenInfo.put("userRole", request.getAttribute("userRole"));
        tokenInfo.put("message", "Token is valid");
        return ResponseEntity.ok(tokenInfo);
    }

    @PostMapping("/validate-token")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            if (token == null || token.trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("valid", false);
                response.put("message", "Token is required");
                return ResponseEntity.badRequest().body(response);
            }
            return ResponseEntity.ok(userService.validateToken(token));
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("valid", false);
            errorResponse.put("message", "Token validation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("service", "user-management-service");
        health.put("status", "UP");
        health.put("timestamp", System.currentTimeMillis());
        health.put("version", "1.0.0");
        return ResponseEntity.ok(health);
    }

    // ========== AUTHENTICATED ENDPOINTS ==========

    @GetMapping("/profile/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserProfile(@PathVariable Long id, HttpServletRequest request) {
        Long currentUserId = (Long) request.getAttribute("userId");
        String currentUserRole = (String) request.getAttribute("userRole");

        if (!currentUserId.equals(id) && !"ADMIN".equals(currentUserRole)) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Access denied. You can only view your own profile.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        }

        return ResponseEntity.ok(userService.getUserProfile(id));
    }


    @PutMapping("/profile/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> updateUserProfile(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates,
            HttpServletRequest request) {
        Long currentUserId = (Long) request.getAttribute("userId");
        String currentUserRole = (String) request.getAttribute("userRole");

        if (!currentUserId.equals(id) && !"ADMIN".equals(currentUserRole)) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Access denied. You can only update your own profile.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
        }

        return ResponseEntity.ok(userService.updateUserProfile(id, updates));
    }
}
