package com.courseplatform.user_management_service.entity;

public enum UserRole {
    STUDENT("Student - Can purchase and take courses"),
    INSTRUCTOR("Instructor - Can create and sell courses"),
    ADMIN("Administrator - Platform management");

    private final String description;

    UserRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public String getDisplayName() {
        return this.name().substring(0, 1).toUpperCase() +
                this.name().substring(1).toLowerCase();
    }
}
