#!/usr/bin/env groovy

import jenkins.model.*
import hudson.model.*
import hudson.tools.*
import hudson.util.DescribableList
import hudson.plugins.sonar.*
import hudson.plugins.sonar.model.TriggersConfig
import org.jenkinsci.plugins.docker.commons.tools.*
import jenkins.plugins.nodejs.tools.*

def instance = Jenkins.getInstance()

// Configure Maven
def mavenDesc = instance.getDescriptor("hudson.tasks.Maven")
def mavenInstallations = [
  new Maven.MavenInstallation("Maven-3.9.5", "/opt/maven", [])
]
mavenDesc.setInstallations(mavenInstallations as Maven.MavenInstallation[])
mavenDesc.save()

// Configure Git
def gitDesc = instance.getDescriptor("hudson.plugins.git.GitTool")
def gitInstallations = [
  new GitTool("Default", "/usr/bin/git", [])
]
gitDesc.setInstallations(gitInstallations as GitTool[])
gitDesc.save()

// Configure NodeJS
def nodejsDesc = instance.getDescriptor("jenkins.plugins.nodejs.tools.NodeJSInstallation")
if (nodejsDesc != null) {
    def nodejsInstaller = new NodeJSInstaller("18.18.2", "", 72)
    def installSourceProperty = new InstallSourceProperty([nodejsInstaller])
    def nodejsInstallations = [
        new NodeJSInstallation("NodeJS-18", "", [installSourceProperty])
    ]
    nodejsDesc.setInstallations(nodejsInstallations as NodeJSInstallation[])
    nodejsDesc.save()
}

// Configure Docker
def dockerDesc = instance.getDescriptor("org.jenkinsci.plugins.docker.commons.tools.DockerTool")
if (dockerDesc != null) {
    def dockerInstallations = [
        new DockerTool("Docker", "/usr/bin/docker", [])
    ]
    dockerDesc.setInstallations(dockerInstallations as DockerTool[])
    dockerDesc.save()
}

// Configure SonarQube Scanner
def sonarDesc = instance.getDescriptor("hudson.plugins.sonar.SonarRunnerInstallation")
if (sonarDesc != null) {
    def sonarInstallations = [
        new SonarRunnerInstallation("SonarScanner", "/opt/sonar-scanner", [])
    ]
    sonarDesc.setInstallations(sonarInstallations as SonarRunnerInstallation[])
    sonarDesc.save()
}

// Configure Global Tool Configuration
def globalConfig = instance.getDescriptor("hudson.tools.ToolLocationNodeProperty")

instance.save()

println "Tools configuration completed successfully"