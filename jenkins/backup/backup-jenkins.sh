#!/bin/bash

# Jenkins Backup Script
# This script creates comprehensive backups of Jenkins configuration and data

set -euo pipefail

# Configuration
JENKINS_HOME="${JENKINS_HOME:-/var/jenkins_home}"
BACKUP_DIR="${BACKUP_DIR:-/backup/jenkins}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="jenkins_backup_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# S3 Configuration (optional)
S3_BUCKET="${S3_BUCKET:-}"
S3_PREFIX="${S3_PREFIX:-jenkins-backups}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Notification Configuration
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
EMAIL_RECIPIENTS="${EMAIL_RECIPIENTS:-}"

# Logging
LOG_FILE="${BACKUP_DIR}/backup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        INFO)
            echo -e "${BLUE}[INFO]${NC} ${message}"
            ;;
        WARN)
            echo -e "${YELLOW}[WARN]${NC} ${message}"
            ;;
        ERROR)
            echo -e "${RED}[ERROR]${NC} ${message}"
            ;;
        SUCCESS)
            echo -e "${GREEN}[SUCCESS]${NC} ${message}"
            ;;
    esac
    
    echo "[${timestamp}] [${level}] ${message}" >> "${LOG_FILE}"
}

# Error handler
error_handler() {
    local line_number=$1
    log ERROR "Script failed at line ${line_number}"
    send_notification "FAILED" "Jenkins backup failed at line ${line_number}"
    exit 1
}

trap 'error_handler ${LINENO}' ERR

# Send notification function
send_notification() {
    local status=$1
    local message=$2
    local color
    
    case $status in
        SUCCESS)
            color="good"
            ;;
        FAILED)
            color="danger"
            ;;
        WARNING)
            color="warning"
            ;;
    esac
    
    # Slack notification
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"${color}\",
                    \"title\": \"Jenkins Backup ${status}\",
                    \"text\": \"${message}\",
                    \"fields\": [
                        {\"title\": \"Backup Name\", \"value\": \"${BACKUP_NAME}\", \"short\": true},
                        {\"title\": \"Timestamp\", \"value\": \"${TIMESTAMP}\", \"short\": true},
                        {\"title\": \"Jenkins Home\", \"value\": \"${JENKINS_HOME}\", \"short\": true},
                        {\"title\": \"Backup Location\", \"value\": \"${BACKUP_PATH}\", \"short\": true}
                    ]
                }]
            }" \
            "$SLACK_WEBHOOK_URL" || log WARN "Failed to send Slack notification"
    fi
    
    # Email notification
    if [[ -n "$EMAIL_RECIPIENTS" ]] && command -v mail >/dev/null 2>&1; then
        echo -e "Subject: Jenkins Backup ${status}\n\n${message}\n\nBackup Details:\n- Name: ${BACKUP_NAME}\n- Timestamp: ${TIMESTAMP}\n- Jenkins Home: ${JENKINS_HOME}\n- Backup Location: ${BACKUP_PATH}" | \
            mail -s "Jenkins Backup ${status}" "$EMAIL_RECIPIENTS" || log WARN "Failed to send email notification"
    fi
}

# Check prerequisites
check_prerequisites() {
    log INFO "Checking prerequisites..."
    
    # Check if Jenkins home exists
    if [[ ! -d "$JENKINS_HOME" ]]; then
        log ERROR "Jenkins home directory not found: $JENKINS_HOME"
        exit 1
    fi
    
    # Check if backup directory exists, create if not
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log INFO "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
    
    # Check available disk space
    local available_space=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    local jenkins_size=$(du -s "$JENKINS_HOME" | awk '{print $1}')
    local required_space=$((jenkins_size * 2)) # 2x for compression buffer
    
    if [[ $available_space -lt $required_space ]]; then
        log ERROR "Insufficient disk space. Available: ${available_space}KB, Required: ${required_space}KB"
        exit 1
    fi
    
    log SUCCESS "Prerequisites check passed"
}

# Create backup directory structure
create_backup_structure() {
    log INFO "Creating backup directory structure..."
    
    mkdir -p "${BACKUP_PATH}"/{config,jobs,plugins,secrets,logs,workspace}
    
    log SUCCESS "Backup directory structure created"
}

# Backup Jenkins configuration
backup_configuration() {
    log INFO "Backing up Jenkins configuration..."
    
    # Core configuration files
    local config_files=(
        "config.xml"
        "jenkins.model.JenkinsLocationConfiguration.xml"
        "hudson.model.UpdateCenter.xml"
        "hudson.plugins.git.GitSCM.xml"
        "hudson.tasks.Mailer.xml"
        "jenkins.security.QueueItemAuthenticatorConfiguration.xml"
        "org.jenkinsci.plugins.workflow.libs.GlobalLibraries.xml"
        "scriptApproval.xml"
        "nodeMonitors.xml"
        "queue.xml"
    )
    
    for file in "${config_files[@]}"; do
        if [[ -f "${JENKINS_HOME}/${file}" ]]; then
            cp "${JENKINS_HOME}/${file}" "${BACKUP_PATH}/config/"
            log INFO "Backed up: ${file}"
        fi
    done
    
    # Backup users directory
    if [[ -d "${JENKINS_HOME}/users" ]]; then
        cp -r "${JENKINS_HOME}/users" "${BACKUP_PATH}/config/"
        log INFO "Backed up users directory"
    fi
    
    # Backup secrets
    if [[ -d "${JENKINS_HOME}/secrets" ]]; then
        cp -r "${JENKINS_HOME}/secrets" "${BACKUP_PATH}/secrets/"
        log INFO "Backed up secrets directory"
    fi
    
    # Backup credentials
    if [[ -f "${JENKINS_HOME}/credentials.xml" ]]; then
        cp "${JENKINS_HOME}/credentials.xml" "${BACKUP_PATH}/secrets/"
        log INFO "Backed up credentials"
    fi
    
    log SUCCESS "Configuration backup completed"
}

# Backup Jenkins jobs
backup_jobs() {
    log INFO "Backing up Jenkins jobs..."
    
    if [[ -d "${JENKINS_HOME}/jobs" ]]; then
        # Create jobs backup with exclusions
        rsync -av \
            --exclude='builds/*/workspace' \
            --exclude='builds/*/archive' \
            --exclude='builds/*/htmlreports' \
            --exclude='builds/*/jacoco' \
            --exclude='builds/*/cobertura' \
            --exclude='builds/*/cucumber-html-reports' \
            --exclude='builds/*/target' \
            --exclude='builds/*/node_modules' \
            --exclude='*.tmp' \
            --exclude='*.log' \
            "${JENKINS_HOME}/jobs/" "${BACKUP_PATH}/jobs/"
        
        log INFO "Jobs backup completed (excluding large artifacts)"
    else
        log WARN "Jobs directory not found"
    fi
}

# Backup plugins
backup_plugins() {
    log INFO "Backing up Jenkins plugins..."
    
    if [[ -d "${JENKINS_HOME}/plugins" ]]; then
        # Backup plugin configurations only (not the .jpi files)
        find "${JENKINS_HOME}/plugins" -name "*.xml" -o -name "*.json" -o -name "*.properties" | \
            while read -r file; do
                local rel_path=${file#${JENKINS_HOME}/plugins/}
                local dest_dir="${BACKUP_PATH}/plugins/$(dirname "$rel_path")"
                mkdir -p "$dest_dir"
                cp "$file" "$dest_dir/"
            done
        
        # Backup plugins list
        if [[ -f "${JENKINS_HOME}/plugins.txt" ]]; then
            cp "${JENKINS_HOME}/plugins.txt" "${BACKUP_PATH}/plugins/"
        fi
        
        log SUCCESS "Plugins configuration backup completed"
    else
        log WARN "Plugins directory not found"
    fi
}

# Backup logs (recent only)
backup_logs() {
    log INFO "Backing up recent Jenkins logs..."
    
    if [[ -d "${JENKINS_HOME}/logs" ]]; then
        # Backup logs from last 7 days
        find "${JENKINS_HOME}/logs" -name "*.log" -mtime -7 -exec cp {} "${BACKUP_PATH}/logs/" \;
        log SUCCESS "Recent logs backup completed"
    else
        log WARN "Logs directory not found"
    fi
}

# Create backup metadata
create_metadata() {
    log INFO "Creating backup metadata..."
    
    local metadata_file="${BACKUP_PATH}/backup_metadata.json"
    
    cat > "$metadata_file" << EOF
{
    "backup_name": "${BACKUP_NAME}",
    "timestamp": "${TIMESTAMP}",
    "jenkins_home": "${JENKINS_HOME}",
    "backup_path": "${BACKUP_PATH}",
    "jenkins_version": "$(cat "${JENKINS_HOME}/jenkins.install.InstallUtil.lastExecVersion" 2>/dev/null || echo "unknown")",
    "backup_size": "$(du -sh "${BACKUP_PATH}" | cut -f1)",
    "backup_type": "full",
    "retention_days": ${RETENTION_DAYS},
    "created_by": "$(whoami)",
    "hostname": "$(hostname)",
    "backup_script_version": "1.0.0"
}
EOF
    
    log SUCCESS "Backup metadata created"
}

# Compress backup
compress_backup() {
    log INFO "Compressing backup..."
    
    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
    
    if [[ $? -eq 0 ]]; then
        rm -rf "$BACKUP_NAME"
        log SUCCESS "Backup compressed successfully: ${BACKUP_NAME}.tar.gz"
        
        # Update backup path for further operations
        BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    else
        log ERROR "Failed to compress backup"
        exit 1
    fi
}

# Upload to S3 (if configured)
upload_to_s3() {
    if [[ -n "$S3_BUCKET" ]] && command -v aws >/dev/null 2>&1; then
        log INFO "Uploading backup to S3..."
        
        local s3_path="s3://${S3_BUCKET}/${S3_PREFIX}/${BACKUP_NAME}.tar.gz"
        
        aws s3 cp "$BACKUP_PATH" "$s3_path" --region "$AWS_REGION"
        
        if [[ $? -eq 0 ]]; then
            log SUCCESS "Backup uploaded to S3: $s3_path"
        else
            log ERROR "Failed to upload backup to S3"
        fi
    else
        log INFO "S3 upload skipped (not configured or AWS CLI not available)"
    fi
}

# Clean old backups
cleanup_old_backups() {
    log INFO "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."
    
    # Local cleanup
    find "$BACKUP_DIR" -name "jenkins_backup_*.tar.gz" -mtime +${RETENTION_DAYS} -delete
    
    local deleted_count=$(find "$BACKUP_DIR" -name "jenkins_backup_*.tar.gz" -mtime +${RETENTION_DAYS} 2>/dev/null | wc -l)
    log INFO "Deleted ${deleted_count} old local backups"
    
    # S3 cleanup (if configured)
    if [[ -n "$S3_BUCKET" ]] && command -v aws >/dev/null 2>&1; then
        local cutoff_date=$(date -d "${RETENTION_DAYS} days ago" +%Y-%m-%d)
        
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" --region "$AWS_REGION" | \
            awk '{print $1" "$2" "$4}' | \
            while read -r date time file; do
                if [[ "$date" < "$cutoff_date" ]]; then
                    aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${file}" --region "$AWS_REGION"
                    log INFO "Deleted old S3 backup: ${file}"
                fi
            done
    fi
    
    log SUCCESS "Old backups cleanup completed"
}

# Verify backup integrity
verify_backup() {
    log INFO "Verifying backup integrity..."
    
    if [[ -f "$BACKUP_PATH" ]]; then
        # Test tar file integrity
        tar -tzf "$BACKUP_PATH" >/dev/null 2>&1
        
        if [[ $? -eq 0 ]]; then
            log SUCCESS "Backup integrity verified"
            return 0
        else
            log ERROR "Backup integrity check failed"
            return 1
        fi
    else
        log ERROR "Backup file not found: $BACKUP_PATH"
        return 1
    fi
}

# Main backup function
main() {
    log INFO "Starting Jenkins backup process..."
    log INFO "Backup name: $BACKUP_NAME"
    log INFO "Jenkins home: $JENKINS_HOME"
    log INFO "Backup directory: $BACKUP_DIR"
    
    # Execute backup steps
    check_prerequisites
    create_backup_structure
    backup_configuration
    backup_jobs
    backup_plugins
    backup_logs
    create_metadata
    compress_backup
    
    # Verify backup
    if verify_backup; then
        upload_to_s3
        cleanup_old_backups
        
        local backup_size=$(du -sh "$BACKUP_PATH" | cut -f1)
        local success_message="Jenkins backup completed successfully! Backup size: ${backup_size}"
        
        log SUCCESS "$success_message"
        send_notification "SUCCESS" "$success_message"
    else
        send_notification "FAILED" "Backup integrity verification failed"
        exit 1
    fi
}

# Script usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Jenkins Backup Script

OPTIONS:
    -h, --help              Show this help message
    -j, --jenkins-home      Jenkins home directory (default: /var/jenkins_home)
    -b, --backup-dir        Backup directory (default: /backup/jenkins)
    -r, --retention-days    Backup retention in days (default: 30)
    -s, --s3-bucket         S3 bucket for remote backup
    -p, --s3-prefix         S3 prefix for backup files (default: jenkins-backups)
    --dry-run              Show what would be backed up without actually doing it

ENVIRONMENT VARIABLES:
    JENKINS_HOME           Jenkins home directory
    BACKUP_DIR             Backup directory
    RETENTION_DAYS         Backup retention in days
    S3_BUCKET              S3 bucket name
    S3_PREFIX              S3 prefix
    AWS_REGION             AWS region (default: us-east-1)
    SLACK_WEBHOOK_URL      Slack webhook for notifications
    EMAIL_RECIPIENTS       Email addresses for notifications

EXAMPLES:
    # Basic backup
    $0

    # Backup with custom directories
    $0 --jenkins-home /opt/jenkins --backup-dir /backups

    # Backup with S3 upload
    $0 --s3-bucket my-jenkins-backups

    # Dry run
    $0 --dry-run

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -j|--jenkins-home)
            JENKINS_HOME="$2"
            shift 2
            ;;
        -b|--backup-dir)
            BACKUP_DIR="$2"
            shift 2
            ;;
        -r|--retention-days)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        -s|--s3-bucket)
            S3_BUCKET="$2"
            shift 2
            ;;
        -p|--s3-prefix)
            S3_PREFIX="$2"
            shift 2
            ;;
        --dry-run)
            log INFO "DRY RUN MODE - No actual backup will be performed"
            log INFO "Would backup: $JENKINS_HOME"
            log INFO "Would store in: $BACKUP_DIR"
            log INFO "Would retain for: $RETENTION_DAYS days"
            [[ -n "$S3_BUCKET" ]] && log INFO "Would upload to S3: s3://$S3_BUCKET/$S3_PREFIX"
            exit 0
            ;;
        *)
            log ERROR "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Run main function
main "$@"