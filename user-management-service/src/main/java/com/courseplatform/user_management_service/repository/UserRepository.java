package com.courseplatform.user_management_service.repository;

import com.courseplatform.user_management_service.entity.User;
import com.courseplatform.user_management_service.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    
    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);
    
    boolean existsByUsername(String username);

    // Find all active users
    @Query("SELECT u FROM User u WHERE u.isActive = true")
    List<User> findAllActiveUsers();

    // Find users by role
    List<User> findByRole(UserRole role);

    // Find active users by role
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.isActive = true")
    List<User> findActiveUsersByRole(@Param("role") UserRole role);

    // Verified instructors (use enum param explicitly)
    @Query("SELECT u FROM User u WHERE u.role = :instructorRole AND u.isActive = true AND u.isVerified = true")
    List<User> findVerifiedInstructors(@Param("instructorRole") UserRole instructorRole);

    // Count users by role
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.isActive = true")
    Long countActiveUsersByRole(@Param("role") UserRole role);

    // Case-insensitive name search
    @Query("SELECT u FROM User u WHERE (LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :name, '%'))) AND u.isActive = true")
    List<User> findByFullNameContainingIgnoreCase(@Param("name") String name);

}
