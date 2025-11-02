package com.example.enrollmentservice.controller;

public class StageRequest {
    private boolean completed;
    private Integer stage; // Optional: current stage number

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    
    public Integer getStage() { return stage; }
    public void setStage(Integer stage) { this.stage = stage; }
}

