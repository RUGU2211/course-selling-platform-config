#!/bin/bash

# Jenkins Restore Script
# This script restores Jenkins configuration and data from backups

set -euo pipefail

# Configuration
JENKINS_HOME="${JENKINS_HOME:-/var/jenkins_home}"
BACKUP_DIR="${BACKUP_DIR:-/backup/jenkins}"
RESTORE_TYPE="${RESTORE_TYPE:-full}"
BACKUP_FILE=""
FORCE_RESTORE="${FORCE_RESTORE:-false}"

# S3 Configuration (optional)
S3_BUCKET="${S3_BUCKET:-}"
S3_PREFIX="${S3_PREFIX:-jenkins-backups}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Notification Configuration
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
EMAIL_RECIPIENTS="${EMAIL_RECIPIENTS:-}"

# Logging
LOG_FILE="${BACKUP_DIR}/restore.log"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

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
    send_notification "FAILED" "Jenkins restore failed at line ${line_number}"
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
                    \"title\": \"Jenkins Restore ${status}\",
                    \"text\": \"${message}\",
                    \"fields\": [
                        {\"title\": \"Backup File\", \"value\": \"${BACKUP_FILE}\", \"short\": true},
                        {\"title\": \"Restore Type\", \"value\": \"${RESTORE_TYPE}\", \"short\": true},
                        {\"title\": \"Jenkins Home\", \"value\": \"${JENKINS_HOME}\", \"short\": true},
                        {\"title\": \"Timestamp\", \"value\": \"${TIMESTAMP}\", \"short\": true}
                    ]
                }]
            }" \
            "$SLACK_WEBHOOK_URL" || log WARN "Failed to send Slack notification"
    fi
    
    # Email notification
    if [[ -n "$EMAIL_RECIPIENTS" ]] && command -v mail >/dev/null 2>&1; then
        echo -e "Subject: Jenkins Restore ${status}\n\n${message}\n\nRestore Details:\n- Backup File: ${BACKUP_FILE}\n- Restore Type: ${RESTORE_TYPE}\n- Jenkins Home: ${JENKINS_HOME}\n- Timestamp: ${TIMESTAMP}" | \
            mail -s "Jenkins Restore ${status}" "$EMAIL_RECIPIENTS" || log WARN "Failed to send email notification"
    fi
}

# List available backups
list_backups() {
    log INFO "Available local backups:"
    
    if [[ -d "$BACKUP_DIR" ]]; then
        local backups=($(find "$BACKUP_DIR" -name "jenkins_backup_*.tar.gz" -type f | sort -r))
        
        if [[ ${#backups[@]} -eq 0 ]]; then
            log WARN "No local backups found in $BACKUP_DIR"
        else
            for i in "${!backups[@]}"; do
                local backup="${backups[$i]}"
                local size=$(du -sh "$backup" | cut -f1)
                local date=$(stat -c %y "$backup" | cut -d' ' -f1)
                printf "%2d) %s (%s, %s)\n" $((i+1)) "$(basename "$backup")" "$size" "$date"
            done
        fi
    fi
    
    # List S3 backups if configured
    if [[ -n "$S3_BUCKET" ]] && command -v aws >/dev/null 2>&1; then
        log INFO "Available S3 backups:"
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" --region "$AWS_REGION" | \
            grep "jenkins_backup_.*\.tar\.gz" | \
            awk '{print $1" "$2" "$3" "$4}' | \
            sort -r | \
            nl -w2 -s') '
    fi
}

# Download backup from S3
download_from_s3() {
    local s3_file=$1
    local local_file="${BACKUP_DIR}/$(basename "$s3_file")"
    
    log INFO "Downloading backup from S3: $s3_file"
    
    aws s3 cp "s3://${S3_BUCKET}/${S3_PREFIX}/${s3_file}" "$local_file" --region "$AWS_REGION"
    
    if [[ $? -eq 0 ]]; then
        log SUCCESS "Backup downloaded: $local_file"
        BACKUP_FILE="$local_file"
    else
        log ERROR "Failed to download backup from S3"
        exit 1
    fi
}

# Verify backup file
verify_backup() {
    local backup_file=$1
    
    log INFO "Verifying backup file: $backup_file"
    
    if [[ ! -f "$backup_file" ]]; then
        log ERROR "Backup file not found: $backup_file"
        return 1
    fi
    
    # Test tar file integrity
    tar -tzf "$backup_file" >/dev/null 2>&1
    
    if [[ $? -eq 0 ]]; then
        log SUCCESS "Backup file integrity verified"
        return 0
    else
        log ERROR "Backup file is corrupted or invalid"
        return 1
    fi
}

# Create pre-restore backup
create_pre_restore_backup() {
    if [[ -d "$JENKINS_HOME" ]] && [[ "$FORCE_RESTORE" != "true" ]]; then
        log INFO "Creating pre-restore backup of current Jenkins home..."
        
        local pre_restore_backup="${BACKUP_DIR}/pre_restore_backup_${TIMESTAMP}.tar.gz"
        
        tar -czf "$pre_restore_backup" -C "$(dirname "$JENKINS_HOME")" "$(basename "$JENKINS_HOME")"
        
        if [[ $? -eq 0 ]]; then
            log SUCCESS "Pre-restore backup created: $pre_restore_backup"
        else
            log ERROR "Failed to create pre-restore backup"
            exit 1
        fi
    fi
}

# Stop Jenkins service
stop_jenkins() {
    log INFO "Stopping Jenkins service..."
    
    # Try different methods to stop Jenkins
    if systemctl is-active --quiet jenkins 2>/dev/null; then
        sudo systemctl stop jenkins
        log SUCCESS "Jenkins service stopped via systemctl"
    elif service jenkins status >/dev/null 2>&1; then
        sudo service jenkins stop
        log SUCCESS "Jenkins service stopped via service command"
    elif pgrep -f jenkins >/dev/null; then
        log WARN "Jenkins process found but service not detected. Manual intervention may be required."
        if [[ "$FORCE_RESTORE" == "true" ]]; then
            pkill -f jenkins
            log WARN "Jenkins process killed forcefully"
        else
            log ERROR "Please stop Jenkins manually before proceeding"
            exit 1
        fi
    else
        log INFO "Jenkins service not running"
    fi
    
    # Wait for Jenkins to fully stop
    sleep 5
}

# Start Jenkins service
start_jenkins() {
    log INFO "Starting Jenkins service..."
    
    if command -v systemctl >/dev/null 2>&1; then
        sudo systemctl start jenkins
        sleep 10
        if systemctl is-active --quiet jenkins; then
            log SUCCESS "Jenkins service started via systemctl"
        else
            log ERROR "Failed to start Jenkins via systemctl"
            return 1
        fi
    elif command -v service >/dev/null 2>&1; then
        sudo service jenkins start
        sleep 10
        if service jenkins status >/dev/null 2>&1; then
            log SUCCESS "Jenkins service started via service command"
        else
            log ERROR "Failed to start Jenkins via service command"
            return 1
        fi
    else
        log WARN "Unable to start Jenkins service automatically. Please start manually."
    fi
}

# Extract backup
extract_backup() {
    local backup_file=$1
    local extract_dir="${BACKUP_DIR}/restore_temp_${TIMESTAMP}"
    
    log INFO "Extracting backup: $backup_file"
    
    mkdir -p "$extract_dir"
    tar -xzf "$backup_file" -C "$extract_dir"
    
    if [[ $? -eq 0 ]]; then
        log SUCCESS "Backup extracted to: $extract_dir"
        echo "$extract_dir"
    else
        log ERROR "Failed to extract backup"
        exit 1
    fi
}

# Restore configuration
restore_configuration() {
    local extract_dir=$1
    local backup_name=$(ls "$extract_dir" | head -1)
    local config_dir="${extract_dir}/${backup_name}/config"
    
    if [[ ! -d "$config_dir" ]]; then
        log ERROR "Configuration directory not found in backup"
        return 1
    fi
    
    log INFO "Restoring Jenkins configuration..."
    
    # Restore configuration files
    find "$config_dir" -name "*.xml" -type f | while read -r file; do
        local rel_path=${file#${config_dir}/}
        local dest_file="${JENKINS_HOME}/${rel_path}"
        local dest_dir=$(dirname "$dest_file")
        
        mkdir -p "$dest_dir"
        cp "$file" "$dest_file"
        log INFO "Restored: $rel_path"
    done
    
    # Restore users directory
    if [[ -d "${config_dir}/users" ]]; then
        rm -rf "${JENKINS_HOME}/users"
        cp -r "${config_dir}/users" "${JENKINS_HOME}/"
        log INFO "Restored users directory"
    fi
    
    log SUCCESS "Configuration restore completed"
}

# Restore secrets
restore_secrets() {
    local extract_dir=$1
    local backup_name=$(ls "$extract_dir" | head -1)
    local secrets_dir="${extract_dir}/${backup_name}/secrets"
    
    if [[ ! -d "$secrets_dir" ]]; then
        log WARN "Secrets directory not found in backup"
        return 0
    fi
    
    log INFO "Restoring Jenkins secrets..."
    
    # Restore secrets directory
    if [[ -d "${secrets_dir}/secrets" ]]; then
        rm -rf "${JENKINS_HOME}/secrets"
        cp -r "${secrets_dir}/secrets" "${JENKINS_HOME}/"
        log INFO "Restored secrets directory"
    fi
    
    # Restore credentials
    if [[ -f "${secrets_dir}/credentials.xml" ]]; then
        cp "${secrets_dir}/credentials.xml" "${JENKINS_HOME}/"
        log INFO "Restored credentials"
    fi
    
    log SUCCESS "Secrets restore completed"
}

# Restore jobs
restore_jobs() {
    local extract_dir=$1
    local backup_name=$(ls "$extract_dir" | head -1)
    local jobs_dir="${extract_dir}/${backup_name}/jobs"
    
    if [[ ! -d "$jobs_dir" ]]; then
        log WARN "Jobs directory not found in backup"
        return 0
    fi
    
    log INFO "Restoring Jenkins jobs..."
    
    # Remove existing jobs if force restore
    if [[ "$FORCE_RESTORE" == "true" ]] && [[ -d "${JENKINS_HOME}/jobs" ]]; then
        rm -rf "${JENKINS_HOME}/jobs"
    fi
    
    # Restore jobs
    mkdir -p "${JENKINS_HOME}/jobs"
    cp -r "$jobs_dir"/* "${JENKINS_HOME}/jobs/"
    
    log SUCCESS "Jobs restore completed"
}

# Restore plugins
restore_plugins() {
    local extract_dir=$1
    local backup_name=$(ls "$extract_dir" | head -1)
    local plugins_dir="${extract_dir}/${backup_name}/plugins"
    
    if [[ ! -d "$plugins_dir" ]]; then
        log WARN "Plugins directory not found in backup"
        return 0
    fi
    
    log INFO "Restoring Jenkins plugins configuration..."
    
    # Restore plugin configurations
    find "$plugins_dir" -name "*.xml" -o -name "*.json" -o -name "*.properties" | while read -r file; do
        local rel_path=${file#${plugins_dir}/}
        local dest_file="${JENKINS_HOME}/plugins/${rel_path}"
        local dest_dir=$(dirname "$dest_file")
        
        mkdir -p "$dest_dir"
        cp "$file" "$dest_file"
    done
    
    log SUCCESS "Plugins configuration restore completed"
    log INFO "Note: You may need to reinstall plugins manually"
}

# Set proper permissions
set_permissions() {
    log INFO "Setting proper permissions..."
    
    # Get Jenkins user and group
    local jenkins_user="${JENKINS_USER:-jenkins}"
    local jenkins_group="${JENKINS_GROUP:-jenkins}"
    
    # Check if user exists
    if id "$jenkins_user" >/dev/null 2>&1; then
        chown -R "${jenkins_user}:${jenkins_group}" "$JENKINS_HOME"
        chmod -R 755 "$JENKINS_HOME"
        chmod -R 600 "${JENKINS_HOME}/secrets" 2>/dev/null || true
        log SUCCESS "Permissions set for user: $jenkins_user"
    else
        log WARN "Jenkins user '$jenkins_user' not found. Please set permissions manually."
    fi
}

# Cleanup temporary files
cleanup() {
    local extract_dir=$1
    
    if [[ -d "$extract_dir" ]]; then
        rm -rf "$extract_dir"
        log INFO "Temporary files cleaned up"
    fi
}

# Validate restore
validate_restore() {
    log INFO "Validating restore..."
    
    # Check if essential files exist
    local essential_files=(
        "config.xml"
        "jenkins.model.JenkinsLocationConfiguration.xml"
    )
    
    for file in "${essential_files[@]}"; do
        if [[ ! -f "${JENKINS_HOME}/${file}" ]]; then
            log ERROR "Essential file missing after restore: $file"
            return 1
        fi
    done
    
    # Check if Jenkins home structure is valid
    local expected_dirs=(
        "jobs"
        "plugins"
        "users"
    )
    
    for dir in "${expected_dirs[@]}"; do
        if [[ ! -d "${JENKINS_HOME}/${dir}" ]]; then
            log WARN "Expected directory missing: $dir"
        fi
    done
    
    log SUCCESS "Restore validation completed"
}

# Main restore function
restore_jenkins() {
    local backup_file=$1
    
    log INFO "Starting Jenkins restore process..."
    log INFO "Backup file: $backup_file"
    log INFO "Restore type: $RESTORE_TYPE"
    log INFO "Jenkins home: $JENKINS_HOME"
    
    # Verify backup
    if ! verify_backup "$backup_file"; then
        exit 1
    fi
    
    # Create pre-restore backup
    create_pre_restore_backup
    
    # Stop Jenkins
    stop_jenkins
    
    # Extract backup
    local extract_dir=$(extract_backup "$backup_file")
    
    # Perform restore based on type
    case $RESTORE_TYPE in
        full)
            restore_configuration "$extract_dir"
            restore_secrets "$extract_dir"
            restore_jobs "$extract_dir"
            restore_plugins "$extract_dir"
            ;;
        config)
            restore_configuration "$extract_dir"
            restore_secrets "$extract_dir"
            ;;
        jobs)
            restore_jobs "$extract_dir"
            ;;
        plugins)
            restore_plugins "$extract_dir"
            ;;
        *)
            log ERROR "Invalid restore type: $RESTORE_TYPE"
            cleanup "$extract_dir"
            exit 1
            ;;
    esac
    
    # Set permissions
    set_permissions
    
    # Validate restore
    validate_restore
    
    # Cleanup
    cleanup "$extract_dir"
    
    # Start Jenkins
    start_jenkins
    
    local success_message="Jenkins restore completed successfully! Restore type: ${RESTORE_TYPE}"
    log SUCCESS "$success_message"
    send_notification "SUCCESS" "$success_message"
}

# Interactive backup selection
select_backup() {
    list_backups
    
    echo
    read -p "Enter backup number or full path to backup file: " selection
    
    if [[ "$selection" =~ ^[0-9]+$ ]]; then
        # Numeric selection
        local backups=($(find "$BACKUP_DIR" -name "jenkins_backup_*.tar.gz" -type f | sort -r))
        local index=$((selection - 1))
        
        if [[ $index -ge 0 ]] && [[ $index -lt ${#backups[@]} ]]; then
            BACKUP_FILE="${backups[$index]}"
        else
            log ERROR "Invalid backup number: $selection"
            exit 1
        fi
    elif [[ "$selection" =~ ^s3: ]]; then
        # S3 selection
        local s3_file=${selection#s3:}
        download_from_s3 "$s3_file"
    else
        # File path
        BACKUP_FILE="$selection"
    fi
    
    if [[ ! -f "$BACKUP_FILE" ]]; then
        log ERROR "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
}

# Script usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Jenkins Restore Script

OPTIONS:
    -h, --help              Show this help message
    -f, --file              Backup file to restore from
    -j, --jenkins-home      Jenkins home directory (default: /var/jenkins_home)
    -b, --backup-dir        Backup directory (default: /backup/jenkins)
    -t, --type              Restore type: full, config, jobs, plugins (default: full)
    -l, --list              List available backups and exit
    -i, --interactive       Interactive backup selection
    --force                 Force restore without confirmation
    --s3-bucket             S3 bucket for remote backup
    --s3-prefix             S3 prefix for backup files (default: jenkins-backups)

RESTORE TYPES:
    full                    Restore everything (config, secrets, jobs, plugins)
    config                  Restore only configuration and secrets
    jobs                    Restore only jobs
    plugins                 Restore only plugin configurations

ENVIRONMENT VARIABLES:
    JENKINS_HOME           Jenkins home directory
    BACKUP_DIR             Backup directory
    JENKINS_USER           Jenkins user (default: jenkins)
    JENKINS_GROUP          Jenkins group (default: jenkins)
    S3_BUCKET              S3 bucket name
    S3_PREFIX              S3 prefix
    AWS_REGION             AWS region (default: us-east-1)
    SLACK_WEBHOOK_URL      Slack webhook for notifications
    EMAIL_RECIPIENTS       Email addresses for notifications

EXAMPLES:
    # Interactive restore
    $0 --interactive

    # Restore from specific file
    $0 --file /backup/jenkins/jenkins_backup_20231201_120000.tar.gz

    # Restore only configuration
    $0 --file backup.tar.gz --type config

    # List available backups
    $0 --list

    # Restore from S3
    $0 --file s3:jenkins_backup_20231201_120000.tar.gz --s3-bucket my-backups

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -f|--file)
            BACKUP_FILE="$2"
            shift 2
            ;;
        -j|--jenkins-home)
            JENKINS_HOME="$2"
            shift 2
            ;;
        -b|--backup-dir)
            BACKUP_DIR="$2"
            shift 2
            ;;
        -t|--type)
            RESTORE_TYPE="$2"
            shift 2
            ;;
        -l|--list)
            list_backups
            exit 0
            ;;
        -i|--interactive)
            select_backup
            shift
            ;;
        --force)
            FORCE_RESTORE="true"
            shift
            ;;
        --s3-bucket)
            S3_BUCKET="$2"
            shift 2
            ;;
        --s3-prefix)
            S3_PREFIX="$2"
            shift 2
            ;;
        *)
            log ERROR "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate restore type
case $RESTORE_TYPE in
    full|config|jobs|plugins)
        ;;
    *)
        log ERROR "Invalid restore type: $RESTORE_TYPE"
        log ERROR "Valid types: full, config, jobs, plugins"
        exit 1
        ;;
esac

# Main execution
if [[ -z "$BACKUP_FILE" ]]; then
    log ERROR "No backup file specified. Use --file, --interactive, or --list"
    usage
    exit 1
fi

# Handle S3 backup file
if [[ "$BACKUP_FILE" =~ ^s3: ]]; then
    local s3_file=${BACKUP_FILE#s3:}
    download_from_s3 "$s3_file"
fi

# Confirmation prompt
if [[ "$FORCE_RESTORE" != "true" ]]; then
    echo
    log WARN "This will restore Jenkins from backup and may overwrite existing data!"
    log INFO "Backup file: $BACKUP_FILE"
    log INFO "Restore type: $RESTORE_TYPE"
    log INFO "Jenkins home: $JENKINS_HOME"
    echo
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [[ "$confirm" != "yes" ]]; then
        log INFO "Restore cancelled by user"
        exit 0
    fi
fi

# Run restore
restore_jenkins "$BACKUP_FILE"