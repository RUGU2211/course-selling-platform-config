#!/usr/bin/env groovy

/**
 * Slack Notification Pipeline Step
 * 
 * This shared library function sends notifications to Slack
 * with customizable messages, colors, and attachments.
 * 
 * @param config Map containing:
 *   - message: Main message text (required)
 *   - channel: Slack channel (default: env.SLACK_CHANNEL or '#ci-cd')
 *   - color: Message color (default: 'good' for success, 'danger' for failure)
 *   - status: Build status (default: auto-detected from currentBuild.result)
 *   - includeDetails: Whether to include build details (default: true)
 *   - mentionUsers: List of users to mention (default: [])
 *   - customFields: Additional fields to include (default: [])
 *   - webhookUrl: Custom webhook URL (default: env.SLACK_WEBHOOK_URL)
 *   - threadTs: Thread timestamp for replies (optional)
 */
def call(Map config) {
    // Validate required parameters
    if (!config.message) {
        error "message is required"
    }
    
    // Set defaults
    def message = config.message
    def channel = config.channel ?: env.SLACK_CHANNEL ?: '#ci-cd'
    def status = config.status ?: (currentBuild.result ?: 'SUCCESS')
    def includeDetails = config.includeDetails != null ? config.includeDetails : true
    def mentionUsers = config.mentionUsers ?: []
    def customFields = config.customFields ?: []
    def webhookUrl = config.webhookUrl ?: env.SLACK_WEBHOOK_URL
    def threadTs = config.threadTs
    
    // Determine color based on status
    def color = config.color
    if (!color) {
        switch (status.toUpperCase()) {
            case 'SUCCESS':
                color = 'good'
                break
            case 'FAILURE':
                color = 'danger'
                break
            case 'UNSTABLE':
                color = 'warning'
                break
            case 'ABORTED':
                color = '#808080'
                break
            default:
                color = '#439FE0'
        }
    }
    
    // Check if Slack is configured
    if (!webhookUrl) {
        echo "Slack webhook URL not configured, skipping notification"
        return
    }
    
    try {
        stage("Send Slack Notification") {
            echo "Sending Slack notification to ${channel}"
            
            // Build the notification payload
            def payload = buildSlackPayload(
                message, 
                channel, 
                color, 
                status, 
                includeDetails, 
                mentionUsers, 
                customFields,
                threadTs
            )
            
            // Send the notification
            sendSlackMessage(webhookUrl, payload)
            
            echo "✅ Slack notification sent successfully"
        }
    } catch (Exception e) {
        echo "❌ Failed to send Slack notification: ${e.getMessage()}"
        // Don't fail the build for notification failures
    }
}

def buildSlackPayload(message, channel, color, status, includeDetails, mentionUsers, customFields, threadTs) {
    // Add user mentions to message
    def finalMessage = message
    if (mentionUsers) {
        def mentions = mentionUsers.collect { "<@${it}>" }.join(' ')
        finalMessage = "${mentions} ${message}"
    }
    
    // Build basic payload
    def payload = [
        channel: channel,
        username: 'Jenkins CI/CD',
        icon_emoji: getStatusEmoji(status),
        text: finalMessage
    ]
    
    // Add thread timestamp if provided
    if (threadTs) {
        payload.thread_ts = threadTs
    }
    
    // Build attachment with details
    if (includeDetails) {
        def attachment = [
            color: color,
            title: "Build ${env.BUILD_NUMBER} - ${status}",
            title_link: env.BUILD_URL,
            fields: []
        ]
        
        // Add standard fields
        attachment.fields.addAll([
            [
                title: 'Project',
                value: env.JOB_NAME ?: 'Unknown',
                short: true
            ],
            [
                title: 'Branch',
                value: env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'Unknown',
                short: true
            ],
            [
                title: 'Commit',
                value: env.GIT_COMMIT ? "${env.GIT_COMMIT.take(8)}" : 'Unknown',
                short: true
            ],
            [
                title: 'Duration',
                value: formatDuration(currentBuild.duration),
                short: true
            ]
        ])
        
        // Add commit message if available
        if (env.GIT_COMMIT_MESSAGE) {
            attachment.fields.add([
                title: 'Commit Message',
                value: env.GIT_COMMIT_MESSAGE.take(100) + (env.GIT_COMMIT_MESSAGE.length() > 100 ? '...' : ''),
                short: false
            ])
        }
        
        // Add author if available
        if (env.GIT_AUTHOR_NAME) {
            attachment.fields.add([
                title: 'Author',
                value: env.GIT_AUTHOR_NAME,
                short: true
            ])
        }
        
        // Add custom fields
        attachment.fields.addAll(customFields)
        
        // Add test results if available
        if (currentBuild.testResultAction) {
            def testResults = currentBuild.testResultAction
            attachment.fields.add([
                title: 'Test Results',
                value: "✅ ${testResults.totalCount - testResults.failCount} passed, ❌ ${testResults.failCount} failed, ⏭️ ${testResults.skipCount} skipped",
                short: false
            ])
        }
        
        // Add failure details for failed builds
        if (status == 'FAILURE' && currentBuild.description) {
            attachment.fields.add([
                title: 'Failure Reason',
                value: currentBuild.description.take(200) + (currentBuild.description.length() > 200 ? '...' : ''),
                short: false
            ])
        }
        
        // Add footer
        attachment.footer = 'Jenkins CI/CD'
        attachment.footer_icon = 'https://jenkins.io/images/logos/jenkins/jenkins.png'
        attachment.ts = (System.currentTimeMillis() / 1000) as Integer
        
        payload.attachments = [attachment]
    }
    
    return payload
}

def sendSlackMessage(webhookUrl, payload) {
    def payloadJson = groovy.json.JsonBuilder(payload).toString()
    
    // Escape special characters for shell
    def escapedPayload = payloadJson.replace('"', '\\"').replace('`', '\\`').replace('$', '\\$')
    
    sh """
        curl -X POST \\
            -H 'Content-type: application/json' \\
            --data "${escapedPayload}" \\
            "${webhookUrl}"
    """
}

def getStatusEmoji(status) {
    switch (status.toUpperCase()) {
        case 'SUCCESS':
            return ':white_check_mark:'
        case 'FAILURE':
            return ':x:'
        case 'UNSTABLE':
            return ':warning:'
        case 'ABORTED':
            return ':stop_sign:'
        case 'IN_PROGRESS':
            return ':hourglass_flowing_sand:'
        default:
            return ':information_source:'
    }
}

def formatDuration(duration) {
    if (!duration) {
        return 'Unknown'
    }
    
    def seconds = duration / 1000
    def minutes = seconds / 60
    def hours = minutes / 60
    
    if (hours >= 1) {
        return String.format('%.1fh', hours)
    } else if (minutes >= 1) {
        return String.format('%.1fm', minutes)
    } else {
        return String.format('%.0fs', seconds)
    }
}

// Convenience methods for common notification types
def success(String message, Map options = [:]) {
    options.message = message
    options.status = 'SUCCESS'
    call(options)
}

def failure(String message, Map options = [:]) {
    options.message = message
    options.status = 'FAILURE'
    call(options)
}

def warning(String message, Map options = [:]) {
    options.message = message
    options.status = 'UNSTABLE'
    call(options)
}

def info(String message, Map options = [:]) {
    options.message = message
    options.status = 'INFO'
    options.color = '#439FE0'
    call(options)
}

def started(String message = 'Build started', Map options = [:]) {
    options.message = message
    options.status = 'IN_PROGRESS'
    options.color = '#439FE0'
    options.includeDetails = options.includeDetails != null ? options.includeDetails : false
    call(options)
}