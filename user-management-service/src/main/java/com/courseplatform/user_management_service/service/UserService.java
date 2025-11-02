package com.courseplatform.user_management_service.service;
import com.courseplatform.user_management_service.dto.UserLoginDto;
import com.courseplatform.user_management_service.dto.UserRegistrationDto;
import com.courseplatform.user_management_service.dto.UserResponseDto;
import com.courseplatform.user_management_service.entity.User;
import com.courseplatform.user_management_service.entity.UserRole;
import com.courseplatform.user_management_service.repository.UserRepository;

import com.courseplatform.user_management_service.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RefreshScope
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Register a new user (Student or Instructor)
     */
    public Map<String, Object> registerUser(UserRegistrationDto dto) {
        try {
            // Check if user already exists
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new RuntimeException("User with email " + dto.getEmail() + " already exists");
            }
            
            if (userRepository.existsByUsername(dto.getUsername())) {
                throw new RuntimeException("User with username " + dto.getUsername() + " already exists");
            }

            // Validate role
            UserRole role;
            try {
                role = UserRole.valueOf(dto.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid role: " + dto.getRole() + ". Must be STUDENT or INSTRUCTOR");
            }

            // Create new user
            User user = new User();
            user.setUsername(dto.getUsername().toLowerCase().trim());
            user.setEmail(dto.getEmail().toLowerCase().trim());
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            user.setFirstName(dto.getFirstName().trim());
            user.setLastName(dto.getLastName().trim());
            user.setRole(role);

            // Auto-verify students, instructors need manual verification
            if (role == UserRole.STUDENT) {
                user.setVerified(true);
            }

            User savedUser = userRepository.save(user);

            // Generate JWT token
            String token = jwtUtil.generateToken(savedUser);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User registered successfully");
            response.put("user", convertToUserResponseDto(savedUser));
            response.put("token", token);

            return response;

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Login user and generate JWT token
     */
    public Map<String, Object> loginUser(UserLoginDto dto) {
        try {
            User user = userRepository.findByEmail(dto.getEmail().toLowerCase().trim())
                    .orElseThrow(() -> new RuntimeException("Invalid email or password"));

            if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
                throw new RuntimeException("Invalid email or password");
            }

            if (!user.getActive()) {
                throw new RuntimeException("Account is deactivated. Please contact administrator.");
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", convertToUserResponseDto(user));
            response.put("token", token);

            return response;

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Get user profile by ID
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUserProfile(Long id) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", convertToUserResponseDto(user));

            return response;

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Update user profile
     */
    public Map<String, Object> updateUserProfile(Long id, Map<String, Object> updates) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

            boolean updated = false;

            if (updates.containsKey("firstName") && updates.get("firstName") != null) {
                user.setFirstName(updates.get("firstName").toString().trim());
                updated = true;
            }

            if (updates.containsKey("lastName") && updates.get("lastName") != null) {
                user.setLastName(updates.get("lastName").toString().trim());
                updated = true;
            }

            // Support legacy fullName field for backward compatibility
            if (updates.containsKey("fullName") && updates.get("fullName") != null) {
                String fullName = updates.get("fullName").toString().trim();
                String[] nameParts = fullName.split(" ", 2);
                user.setFirstName(nameParts[0]);
                if (nameParts.length > 1) {
                    user.setLastName(nameParts[1]);
                } else {
                    user.setLastName("");
                }
                updated = true;
            }

            if (updated) {
                userRepository.save(user);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile updated successfully");
            response.put("user", convertToUserResponseDto(user));

            return response;

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Get all active users (Admin only)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAllUsers() {
        try {
            List<User> users = userRepository.findAllActiveUsers();

            List<UserResponseDto> userList = users.stream()
                    .map(this::convertToUserResponseDto)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", userList.size());
            response.put("users", userList);

            return response;

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUsersByRole(String roleStr) {
        try {
            UserRole role = UserRole.valueOf(roleStr.toUpperCase());
            List<User> users = userRepository.findActiveUsersByRole(role);

            List<UserResponseDto> userList = users.stream()
                    .map(this::convertToUserResponseDto)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("role", role.getDisplayName());
            response.put("count", userList.size());
            response.put("users", userList);

            return response;

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Get all verified instructors (for course platform)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getVerifiedInstructors() {
        try {
            List<User> instructors = userRepository.findVerifiedInstructors(UserRole.INSTRUCTOR);

            List<UserResponseDto> instructorList = instructors.stream()
                    .map(this::convertToUserResponseDto)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("count", instructorList.size());
            response.put("instructors", instructorList);

            return response;

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Validate JWT token
     */
    public Map<String, Object> validateToken(String token) {
        try {
            if (jwtUtil.isTokenValid(token)) {
                String email = jwtUtil.getEmailFromToken(token);
                Long userId = jwtUtil.getUserIdFromToken(token);
                String role = jwtUtil.getRoleFromToken(token);

                Map<String, Object> response = new HashMap<>();
                response.put("valid", true);
                response.put("userId", userId);
                response.put("email", email);
                response.put("role", role);

                return response;
            }
        } catch (Exception e) {
            // Token validation failed
        }

        Map<String, Object> response = new HashMap<>();
        response.put("valid", false);
        response.put("message", "Invalid or expired token");

        return response;
    }

    /**
     * Get platform statistics (Admin only)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPlatformStats() {
        try {
            Long totalStudents = userRepository.countActiveUsersByRole(UserRole.STUDENT);
            Long totalInstructors = userRepository.countActiveUsersByRole(UserRole.INSTRUCTOR);
            Long totalUsers = totalStudents + totalInstructors;

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("stats", Map.of(
                    "totalUsers", totalUsers,
                    "totalStudents", totalStudents,
                    "totalInstructors", totalInstructors,
                    "verifiedInstructors", userRepository.findVerifiedInstructors(UserRole.INSTRUCTOR).size()
            ));

            return response;

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Search users by name (Admin function)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> searchUsersByName(String name) {
        try {
            List<User> users = userRepository.findByFullNameContainingIgnoreCase(name);

            List<UserResponseDto> userList = users.stream()
                    .map(this::convertToUserResponseDto)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("searchTerm", name);
            response.put("count", userList.size());
            response.put("users", userList);

            return response;

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Deactivate user account (Admin function)
     */
    public Map<String, Object> deactivateUser(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            user.setActive(false);
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User account deactivated successfully");
            response.put("userId", userId);

            return response;

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Activate user account (Admin function)
     */
    public Map<String, Object> activateUser(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            user.setActive(true);
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User account activated successfully");
            response.put("userId", userId);

            return response;

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Verify instructor account (Admin function)
     */
    public Map<String, Object> verifyInstructor(Long instructorId) {
        try {
            User instructor = userRepository.findById(instructorId)
                    .orElseThrow(() -> new RuntimeException("Instructor not found with id: " + instructorId));

            if (instructor.getRole() != UserRole.INSTRUCTOR) {
                throw new RuntimeException("User is not an instructor");
            }

            instructor.setVerified(true);
            userRepository.save(instructor);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Instructor account verified successfully");
            response.put("instructorId", instructorId);

            return response;

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return errorResponse;
        }
    }

    /**
     * Convert User entity to UserResponseDto
     */
    private UserResponseDto convertToUserResponseDto(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setRole(user.getRole());
        dto.setIsActive(user.getActive());
        dto.setIsVerified(user.getVerified());
        dto.setCreatedAt(user.getCreatedAt());

        return dto;
    }
}
