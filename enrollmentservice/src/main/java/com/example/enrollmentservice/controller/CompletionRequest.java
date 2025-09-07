package com.example.enrollmentservice.controller;

public class CompletionRequest {
    private boolean completed;
    private String certificateUrl;

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public String getCertificateUrl() { return certificateUrl; }
    public void setCertificateUrl(String certificateUrl) { this.certificateUrl = certificateUrl; }
}
