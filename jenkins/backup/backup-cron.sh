#!/bin/bash

# Jenkins Backup Cron Script
# This script is designed to be run via cron for automated Jenkins backups

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="${SCRIPT_DIR}/backup-jenkins.sh"
CONFIG_FILE="${SCRIPT_DIR}/backup.conf"
LOCK_FILE="/tmp/jenkins-backup.lock"
LOG_FILE="/var/log/jenkins-backup-cron.log"

# Default configuration
JENKINS_HOME="${JENKINS_HOME:-/var/jenkins_home}"
BACKUP_DIR="${BACKUP_DIR:-/backup/jenkins}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${S3_BUCKET:-}"
S3_PREFIX="${S3_PREFIX:-jenkins-backups}"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
EMAIL_RECIPIENTS="${EMAIL_RECIPIENTS:-}"

# Backup schedule configuration
BACKUP_TYPE="${BACKUP_TYPE:-full}"  # full, incremental, config-only
MAX_PARALLEL_BACKUPS="${MAX_PARALLEL_BACKUPS:-1}"
BACKUP_TIMEOUT="${BACKUP_TIMEOUT:-3600}"  # 1 hour timeout

# Health check configuration
HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-}"  # Optional health check endpoint
HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-30}"

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

# Load configuration file
load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        log INFO "Loading configuration from: $CONFIG_FILE"
        source "$CONFIG_FILE"
    else
        log INFO "No configuration file found, using defaults"
    fi
}

# Create lock file to prevent concurrent backups
acquire_lock() {
    if [[ -f "$LOCK_FILE" ]]; then
        local lock_pid=$(cat "$LOCK_FILE")
        
        # Check if process is still running
        if kill -0 "$lock_pid" 2>/dev/null; then
            log ERROR "Another backup process is already running (PID: $lock_pid)"
            exit 1
        else
            log WARN "Stale lock file found, removing it"
            rm -f "$LOCK_FILE"
        fi
    fi
    
    echo $$ > "$LOCK_FILE"
    log INFO "Lock acquired (PID: $$)"
}

# Release lock file
release_lock() {
    if [[ -f "$LOCK_FILE" ]]; then
        rm -f "$LOCK_FILE"
        log INFO "Lock released"
    fi
}

# Cleanup function
cleanup() {
    release_lock
    
    # Kill backup process if it's still running
    if [[ -n "${BACKUP_PID:-}" ]]; then
        if kill -0 "$BACKUP_PID" 2>/dev/null; then
            log WARN "Killing backup process (PID: $BACKUP_PID)"
            kill -TERM "$BACKUP_PID" 2>/dev/null || true
            sleep 5
            kill -KILL "$BACKUP_PID" 2>/dev/null || true
        fi
    fi
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Check if Jenkins is running and healthy
check_jenkins_health() {
    log INFO "Checking Jenkins health..."
    
    # Check if Jenkins process is running
    if ! pgrep -f jenkins >/dev/null; then
        log ERROR "Jenkins process not found"
        return 1
    fi
    
    # Check Jenkins HTTP endpoint if configured
    if [[ -n "$HEALTH_CHECK_URL" ]]; then
        if curl -f -s --max-time "$HEALTH_CHECK_TIMEOUT" "$HEALTH_CHECK_URL" >/dev/null; then
            log SUCCESS "Jenkins health check passed"
        else
            log ERROR "Jenkins health check failed"
            return 1
        fi
    else
        log INFO "No health check URL configured, skipping HTTP check"
    fi
    
    return 0
}

# Check system resources
check_system_resources() {
    log INFO "Checking system resources..."
    
    # Check disk space
    local backup_dir_space=$(df "$BACKUP_DIR" | awk 'NR==2 {print $4}')
    local jenkins_size=$(du -s "$JENKINS_HOME" | awk '{print $1}')
    local required_space=$((jenkins_size * 3)) # 3x for safety
    
    if [[ $backup_dir_space -lt $required_space ]]; then
        log ERROR "Insufficient disk space. Available: ${backup_dir_space}KB, Required: ${required_space}KB"
        return 1
    fi
    
    # Check memory usage
    local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [[ $memory_usage -gt 90 ]]; then
        log WARN "High memory usage: ${memory_usage}%"
    fi
    
    # Check load average
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    local cpu_cores=$(nproc)
    local load_threshold=$(echo "$cpu_cores * 2" | bc)
    
    if (( $(echo "$load_avg > $load_threshold" | bc -l) )); then
        log WARN "High system load: $load_avg (threshold: $load_threshold)"
    fi
    
    log SUCCESS "System resources check passed"
    return 0
}

# Send health check ping
send_health_check() {
    local status=$1
    local message=$2
    
    # Send to monitoring system (e.g., Healthchecks.io, Dead Man's Snitch)
    if [[ -n "${HEALTHCHECK_PING_URL:-}" ]]; then
        local url="$HEALTHCHECK_PING_URL"
        
        if [[ "$status" == "FAILED" ]]; then
            url="${url}/fail"
        fi
        
        curl -fsS -m 10 --retry 3 -X POST \
            -H "Content-Type: text/plain" \
            --data "$message" \
            "$url" >/dev/null 2>&1 || log WARN "Failed to send health check ping"
    fi
}

# Rotate log files
rotate_logs() {
    if [[ -f "$LOG_FILE" ]]; then
        local log_size=$(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0)
        local max_size=$((10 * 1024 * 1024)) # 10MB
        
        if [[ $log_size -gt $max_size ]]; then
            log INFO "Rotating log file (size: ${log_size} bytes)"
            
            # Keep last 5 log files
            for i in {4..1}; do
                local old_log="${LOG_FILE}.${i}"
                local new_log="${LOG_FILE}.$((i + 1))"
                
                if [[ -f "$old_log" ]]; then
                    mv "$old_log" "$new_log"
                fi
            done
            
            mv "$LOG_FILE" "${LOG_FILE}.1"
            touch "$LOG_FILE"
        fi
    fi
}

# Generate backup report
generate_report() {
    local status=$1
    local backup_file=$2
    local start_time=$3
    local end_time=$4
    
    local duration=$((end_time - start_time))
    local backup_size=""
    
    if [[ -f "$backup_file" ]]; then
        backup_size=$(du -sh "$backup_file" | cut -f1)
    fi
    
    local report_file="${BACKUP_DIR}/backup_report_$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "status": "$status",
    "backup_file": "$backup_file",
    "backup_size": "$backup_size",
    "duration_seconds": $duration,
    "jenkins_home": "$JENKINS_HOME",
    "backup_type": "$BACKUP_TYPE",
    "retention_days": $RETENTION_DAYS,
    "s3_bucket": "$S3_BUCKET",
    "system_info": {
        "hostname": "$(hostname)",
        "disk_usage": "$(df -h "$BACKUP_DIR" | awk 'NR==2 {print $5}')",
        "memory_usage": "$(free | awk 'NR==2{printf "%.0f%%", $3*100/$2}')",
        "load_average": "$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')"
    }
}
EOF
    
    log INFO "Backup report generated: $report_file"
}

# Main backup execution
run_backup() {
    local start_time=$(date +%s)
    local backup_file=""
    local status="FAILED"
    
    log INFO "Starting scheduled Jenkins backup..."
    log INFO "Backup type: $BACKUP_TYPE"
    log INFO "Jenkins home: $JENKINS_HOME"
    log INFO "Backup directory: $BACKUP_DIR"
    
    # Pre-backup checks
    if ! check_jenkins_health; then
        log ERROR "Jenkins health check failed, aborting backup"
        send_health_check "FAILED" "Jenkins health check failed"
        return 1
    fi
    
    if ! check_system_resources; then
        log ERROR "System resources check failed, aborting backup"
        send_health_check "FAILED" "System resources check failed"
        return 1
    fi
    
    # Run backup with timeout
    log INFO "Executing backup script..."
    
    local backup_cmd="$BACKUP_SCRIPT"
    
    # Add backup type specific options
    case $BACKUP_TYPE in
        incremental)
            # For incremental backups, you might want to add specific flags
            # This is a placeholder - implement based on your backup script capabilities
            log INFO "Running incremental backup"
            ;;
        config-only)
            # For config-only backups, you might want to exclude jobs/builds
            log INFO "Running config-only backup"
            ;;
        full)
            log INFO "Running full backup"
            ;;
    esac
    
    # Execute backup with timeout
    timeout "$BACKUP_TIMEOUT" "$backup_cmd" &
    BACKUP_PID=$!
    
    if wait $BACKUP_PID; then
        status="SUCCESS"
        log SUCCESS "Backup completed successfully"
        
        # Find the latest backup file
        backup_file=$(find "$BACKUP_DIR" -name "jenkins_backup_*.tar.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
        
        send_health_check "SUCCESS" "Jenkins backup completed successfully"
    else
        local exit_code=$?
        
        if [[ $exit_code -eq 124 ]]; then
            log ERROR "Backup timed out after $BACKUP_TIMEOUT seconds"
            send_health_check "FAILED" "Jenkins backup timed out"
        else
            log ERROR "Backup failed with exit code: $exit_code"
            send_health_check "FAILED" "Jenkins backup failed with exit code: $exit_code"
        fi
        
        return 1
    fi
    
    local end_time=$(date +%s)
    generate_report "$status" "$backup_file" "$start_time" "$end_time"
    
    return 0
}

# Cleanup old reports
cleanup_old_reports() {
    log INFO "Cleaning up old backup reports..."
    
    find "$BACKUP_DIR" -name "backup_report_*.json" -mtime +7 -delete 2>/dev/null || true
    
    log INFO "Old reports cleanup completed"
}

# Main function
main() {
    # Rotate logs first
    rotate_logs
    
    log INFO "Jenkins backup cron job started"
    
    # Load configuration
    load_config
    
    # Acquire lock
    acquire_lock
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Check if backup script exists
    if [[ ! -f "$BACKUP_SCRIPT" ]]; then
        log ERROR "Backup script not found: $BACKUP_SCRIPT"
        exit 1
    fi
    
    # Make backup script executable
    chmod +x "$BACKUP_SCRIPT"
    
    # Run backup
    if run_backup; then
        log SUCCESS "Backup cron job completed successfully"
    else
        log ERROR "Backup cron job failed"
        exit 1
    fi
    
    # Cleanup old reports
    cleanup_old_reports
    
    log INFO "Jenkins backup cron job finished"
}

# Script usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Jenkins Backup Cron Script

This script is designed to be run via cron for automated Jenkins backups.

OPTIONS:
    -h, --help              Show this help message
    -c, --config            Configuration file path
    -t, --type              Backup type: full, incremental, config-only
    --dry-run              Show what would be done without executing
    --test                 Test configuration and exit

CONFIGURATION FILE:
    The script looks for a configuration file at: ${CONFIG_FILE}
    
    Example configuration:
    
    # Jenkins configuration
    JENKINS_HOME="/var/jenkins_home"
    BACKUP_DIR="/backup/jenkins"
    RETENTION_DAYS=30
    
    # S3 configuration
    S3_BUCKET="my-jenkins-backups"
    S3_PREFIX="jenkins-backups"
    AWS_REGION="us-east-1"
    
    # Notification configuration
    SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
    EMAIL_RECIPIENTS="admin@example.com"
    
    # Health check configuration
    HEALTH_CHECK_URL="http://localhost:8080/login"
    HEALTHCHECK_PING_URL="https://hc-ping.com/your-uuid"
    
    # Backup configuration
    BACKUP_TYPE="full"
    BACKUP_TIMEOUT=3600
    MAX_PARALLEL_BACKUPS=1

CRON EXAMPLES:
    # Daily backup at 2 AM
    0 2 * * * /path/to/backup-cron.sh
    
    # Weekly backup on Sunday at 3 AM
    0 3 * * 0 /path/to/backup-cron.sh
    
    # Hourly incremental backup during business hours
    0 9-17 * * 1-5 /path/to/backup-cron.sh --type incremental

ENVIRONMENT VARIABLES:
    All configuration options can also be set via environment variables.
    Environment variables take precedence over configuration file values.

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -c|--config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        -t|--type)
            BACKUP_TYPE="$2"
            shift 2
            ;;
        --dry-run)
            log INFO "DRY RUN MODE"
            log INFO "Configuration:"
            log INFO "  Jenkins Home: $JENKINS_HOME"
            log INFO "  Backup Dir: $BACKUP_DIR"
            log INFO "  Backup Type: $BACKUP_TYPE"
            log INFO "  Retention: $RETENTION_DAYS days"
            log INFO "  S3 Bucket: ${S3_BUCKET:-not configured}"
            log INFO "  Backup Script: $BACKUP_SCRIPT"
            exit 0
            ;;
        --test)
            log INFO "Testing configuration..."
            load_config
            
            # Test backup script
            if [[ -f "$BACKUP_SCRIPT" ]]; then
                log SUCCESS "Backup script found: $BACKUP_SCRIPT"
            else
                log ERROR "Backup script not found: $BACKUP_SCRIPT"
            fi
            
            # Test Jenkins health
            if check_jenkins_health; then
                log SUCCESS "Jenkins health check passed"
            else
                log ERROR "Jenkins health check failed"
            fi
            
            # Test system resources
            if check_system_resources; then
                log SUCCESS "System resources check passed"
            else
                log ERROR "System resources check failed"
            fi
            
            log INFO "Configuration test completed"
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