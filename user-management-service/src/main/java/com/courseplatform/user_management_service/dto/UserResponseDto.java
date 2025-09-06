package com.courseplatform.user_management_service.dto;

import com.courseplatform.user_management_service.entity.UserRole;

import java.time.LocalDateTime;

public class UserResponseDto {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String bio;
    private String profileImage;
    private UserRole role;
    private String roleDisplayName;
    private Boolean isActive;
    private Boolean isVerified;
    private LocalDateTime createdAt;

    public UserResponseDto() {}

    public UserResponseDto(Long id, String email, String fullName, UserRole role) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.roleDisplayName = role.getDisplayName();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) {
        this.role = role;
        this.roleDisplayName = role != null ? role.getDisplayName() : null;
    }

    public String getRoleDisplayName() { return roleDisplayName; }
    public void setRoleDisplayName(String roleDisplayName) { this.roleDisplayName = roleDisplayName; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}