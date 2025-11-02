package com.example.enrollmentservice.controller;

public class CurrentStageRequest {
    private Integer stage; // Current stage: 0 (not started), 1 (stage 1), 2 (stage 2), 3 (completed)

    public Integer getStage() { return stage; }
    public void setStage(Integer stage) { this.stage = stage; }
}

