#!/usr/bin/env groovy

import jenkins.model.*
import hudson.model.*
import hudson.plugins.sonar.*
import hudson.plugins.sonar.model.TriggersConfig
import jenkins.plugins.slack.*
import org.jenkinsci.plugins.prometheus.*
import hudson.plugins.build_timeout.*
import hudson.plugins.timestamper.*

def instance = Jenkins.getInstance()

// Configure SonarQube Global Configuration
def sonarGlobalConfig = instance.getDescriptor("hudson.plugins.sonar.SonarGlobalConfiguration")
if (sonarGlobalConfig != null) {
    def sonarInstallations = [
        new SonarInstallation(
            "SonarQube",
            System.getenv("SONAR_HOST_URL") ?: "http://sonarqube:9000",
            "sonar-token",
            "",
            "",
            "",
            "",
            new TriggersConfig(),
            ""
        )
    ]
    sonarGlobalConfig.setInstallations(sonarInstallations as SonarInstallation[])
    sonarGlobalConfig.save()
}

// Configure Slack Global Configuration
def slackConfig = instance.getDescriptor("jenkins.plugins.slack.SlackNotifier")
if (slackConfig != null) {
    slackConfig.teamDomain = System.getenv("SLACK_TEAM_DOMAIN") ?: ""
    slackConfig.token = System.getenv("SLACK_TOKEN") ?: ""
    slackConfig.room = "#ci-cd"
    slackConfig.save()
}

// Configure Prometheus Plugin
def prometheusConfig = instance.getDescriptor("org.jenkinsci.plugins.prometheus.PrometheusConfiguration")
if (prometheusConfig != null) {
    prometheusConfig.path = "/prometheus"
    prometheusConfig.defaultNamespace = "jenkins"
    prometheusConfig.jobAttributeName = "jenkins_job"
    prometheusConfig.appendJobBuildNumber = false
    prometheusConfig.countSuccessfulBuilds = true
    prometheusConfig.countUnstableBuilds = true
    prometheusConfig.countFailedBuilds = true
    prometheusConfig.countNotBuiltBuilds = true
    prometheusConfig.countAbortedBuilds = true
    prometheusConfig.fetchTestResults = true
    prometheusConfig.save()
}

// Configure Global Build Discarders
def buildDiscarderProperty = new jenkins.model.BuildDiscarderProperty(
    new hudson.tasks.LogRotator(
        30,  // daysToKeepStr
        50,  // numToKeepStr
        7,   // artifactDaysToKeepStr
        10   // artifactNumToKeepStr
    )
)

// Configure Global Environment Variables
def globalNodeProperties = instance.getGlobalNodeProperties()
def envVarsNodePropertyList = globalNodeProperties.getAll(hudson.slaves.EnvironmentVariablesNodeProperty.class)

def newEnvVarsNodeProperty = null
def envVars = null

if (envVarsNodePropertyList == null || envVarsNodePropertyList.size() == 0) {
    newEnvVarsNodeProperty = new hudson.slaves.EnvironmentVariablesNodeProperty()
    globalNodeProperties.add(newEnvVarsNodeProperty)
    envVars = newEnvVarsNodeProperty.getEnvVars()
} else {
    envVars = envVarsNodePropertyList.get(0).getEnvVars()
}

// Set global environment variables
envVars.put("DOCKER_REGISTRY", System.getenv("DOCKER_REGISTRY") ?: "ghcr.io")
envVars.put("KUBERNETES_NAMESPACE", System.getenv("KUBERNETES_NAMESPACE") ?: "course-platform")
envVars.put("SONAR_HOST_URL", System.getenv("SONAR_HOST_URL") ?: "http://sonarqube:9000")
envVars.put("NEXUS_URL", System.getenv("NEXUS_URL") ?: "http://nexus:8081")
envVars.put("MAVEN_OPTS", "-Xmx2g -Xms1g")
envVars.put("NODE_OPTIONS", "--max-old-space-size=4096")
envVars.put("DOCKER_BUILDKIT", "1")

// Configure Global Pipeline Libraries
def globalLibraries = instance.getDescriptor("org.jenkinsci.plugins.workflow.libs.GlobalLibraries")
if (globalLibraries != null) {
    // This would be configured via JCasC in production
    println "Global Pipeline Libraries should be configured via Configuration as Code"
}

// Configure Build Timeout Global Configuration
def buildTimeoutConfig = instance.getDescriptor("hudson.plugins.build_timeout.BuildTimeoutWrapper")
if (buildTimeoutConfig != null) {
    // Default timeout strategies can be configured here
    println "Build Timeout configuration available"
}

// Configure Timestamper Global Configuration
def timestamperConfig = instance.getDescriptor("hudson.plugins.timestamper.TimestamperBuildWrapper")
if (timestamperConfig != null) {
    timestamperConfig.allPipelines = true
    timestamperConfig.save()
}

instance.save()

println "Global configuration completed successfully"