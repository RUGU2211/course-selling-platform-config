#!/usr/bin/env groovy

import jenkins.model.*
import hudson.security.*
import jenkins.security.s2m.AdminWhitelistRule

def instance = Jenkins.getInstance()

// Disable CLI over remoting
instance.getDescriptor("jenkins.CLI").get().setEnabled(false)

// Enable Agent to master security subsystem
instance.getInjector().getInstance(AdminWhitelistRule.class).setMasterKillSwitch(false)

// Disable old Non-Encrypted protocols
Set<String> agentProtocolsList = ['JNLP4-connect', 'Ping']
if(!instance.getAgentProtocols().equals(agentProtocolsList)) {
    instance.setAgentProtocols(agentProtocolsList)
    println "Agent Protocols have been updated to: ${agentProtocolsList}"
} else {
    println "Agent Protocols were already configured: ${instance.getAgentProtocols()}"
}

// Disable usage stats
instance.setNoUsageStatistics(true)

// Set number of executors
instance.setNumExecutors(2)

// Enable CSRF Protection
def crumbIssuer = new DefaultCrumbIssuer(true)
instance.setCrumbIssuer(crumbIssuer)

// Save configuration
instance.save()

println "Security configuration completed successfully"