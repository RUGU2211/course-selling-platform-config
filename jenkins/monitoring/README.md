# Jenkins Monitoring Setup

This directory contains comprehensive monitoring configurations for Jenkins, including Prometheus alerts and Grafana dashboards for complete observability of your CI/CD pipeline.

## Overview

The monitoring stack includes:
- **Prometheus Alerts**: Comprehensive alerting rules for Jenkins health, performance, and security
- **Grafana Dashboards**: Visual monitoring dashboards for Jenkins metrics
- **Backup Monitoring**: Alerts and metrics for backup operations
- **Integration Monitoring**: Alerts for external service integrations

## Components

### 1. Prometheus Alerts (`prometheus-alerts.yml`)

Comprehensive alerting rules covering:

#### System Health
- Jenkins service availability
- High response times (>5s)
- Memory usage and leaks
- CPU usage monitoring
- Disk space alerts

#### Build Monitoring
- Build queue status
- Executor availability
- Build failure rates
- Critical job failures
- Stuck builds detection
- Build duration anomalies

#### Security Monitoring
- Unauthorized access attempts
- High error rates
- Admin login monitoring
- Plugin security updates

#### Integration Monitoring
- Git connectivity issues
- Docker registry problems
- Kubernetes deployment failures
- SonarQube integration status

#### Backup Monitoring
- Backup failure detection
- Old backup alerts
- Backup verification

### 2. Grafana Dashboards

#### Jenkins Overview Dashboard (`grafana-jenkins-dashboard.json`)
- **UID**: `jenkins-overview`
- **Purpose**: High-level Jenkins health and performance overview
- **Panels**:
  - Build Duration (50th and 95th percentiles)
  - Build Queue Size gauge
  - Build Results Distribution pie chart
  - Available Executors status
  - JVM Memory Usage trends
  - CPU Usage monitoring
  - Build Rate over time
  - Node Status table

#### Jenkins Jobs Performance Dashboard (`grafana-jenkins-jobs-dashboard.json`)
- **UID**: `jenkins-jobs-performance`
- **Purpose**: Detailed job-specific performance analysis
- **Features**:
  - Job filtering via template variables
  - Job-specific build duration analysis
  - Failure rate tracking per job
  - Hourly build count trends
  - Latest build information
  - Currently building jobs status

### 3. Dashboard Provisioning (`grafana-dashboards-provisioning.yml`)
- Automatically loads dashboards into Grafana
- Creates "Jenkins" folder for organization
- Enables dashboard updates from files

## Setup Instructions

### Prerequisites

1. **Prometheus** configured to scrape Jenkins metrics
2. **Grafana** instance for dashboard visualization
3. **Jenkins Prometheus Plugin** installed and configured
4. **Alertmanager** for alert routing (optional but recommended)

### 1. Configure Jenkins Metrics

Ensure Jenkins has the Prometheus plugin installed and configured:

```groovy
// Add to Jenkins init script or configure via UI
import jenkins.model.Jenkins
import org.jenkinsci.plugins.prometheus.PrometheusConfiguration

def prometheus = Jenkins.instance.getExtensionList(PrometheusConfiguration.class)[0]
prometheus.setPath("/prometheus")
prometheus.setDefaultNamespace("jenkins")
prometheus.setJobAttributeName("jenkins_job")
prometheus.save()
```

### 2. Deploy Prometheus Alerts

1. Copy `prometheus-alerts.yml` to your Prometheus configuration directory
2. Update your `prometheus.yml` to include the alerts:

```yaml
rule_files:
  - "prometheus-alerts.yml"
```

3. Restart Prometheus to load the new rules

### 3. Configure Grafana Dashboards

#### Option A: Manual Import
1. Open Grafana UI
2. Go to "+" → Import
3. Upload the JSON files or paste their content
4. Configure data source (Prometheus)

#### Option B: Automatic Provisioning
1. Copy dashboard JSON files to Grafana provisioning directory:
   ```bash
   cp *.json /etc/grafana/provisioning/dashboards/jenkins/
   ```

2. Copy provisioning config:
   ```bash
   cp grafana-dashboards-provisioning.yml /etc/grafana/provisioning/dashboards/
   ```

3. Restart Grafana

### 4. Configure Alertmanager (Optional)

Example Alertmanager configuration for Jenkins alerts:

```yaml
route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'jenkins-alerts'
  routes:
  - match:
      service: jenkins
    receiver: 'jenkins-team'

receivers:
- name: 'jenkins-alerts'
  slack_configs:
  - api_url: 'YOUR_SLACK_WEBHOOK_URL'
    channel: '#jenkins-alerts'
    title: 'Jenkins Alert'
    text: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

- name: 'jenkins-team'
  email_configs:
  - to: 'jenkins-team@company.com'
    subject: 'Jenkins Alert: {{ .GroupLabels.alertname }}'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      {{ end }}
```

## Metrics Reference

### Key Jenkins Metrics

| Metric | Description | Type |
|--------|-------------|------|
| `jenkins_builds_duration_milliseconds_summary` | Build duration percentiles | Summary |
| `jenkins_queue_size_value` | Number of jobs in queue | Gauge |
| `jenkins_builds_last_build_result_ordinal` | Last build result (0=success, 1=unstable, 2=failure) | Gauge |
| `jenkins_executor_free_value` | Number of free executors | Gauge |
| `jenkins_vm_memory_heap_used` | JVM heap memory used | Gauge |
| `jenkins_vm_cpu_load` | CPU load | Gauge |
| `jenkins_node_online_value` | Node online status | Gauge |
| `jenkins_builds_success_build_count` | Successful builds counter | Counter |
| `jenkins_builds_failed_build_count` | Failed builds counter | Counter |

### Custom Labels

- `job`: Jenkins job name
- `node`: Jenkins node name
- `instance`: Jenkins instance
- `result`: Build result (SUCCESS, FAILURE, UNSTABLE, ABORTED)

## Alert Thresholds

### Critical Alerts (Immediate Action Required)
- Jenkins service down
- No available executors
- Critical job failures
- Backup failures
- Security breaches

### Warning Alerts (Investigation Needed)
- High response times (>5s)
- Memory usage >80%
- Disk usage >85%
- Build failure rate >10%
- Queue size >10

### Info Alerts (Monitoring)
- Plugin updates available
- Old backups (>7 days)
- Long-running builds

## Customization

### Adding Custom Alerts

1. Edit `prometheus-alerts.yml`
2. Add new alert rules following the existing pattern:

```yaml
- alert: CustomJenkinsAlert
  expr: your_metric_expression
  for: 5m
  labels:
    severity: warning
    service: jenkins
  annotations:
    summary: "Custom alert summary"
    description: "Detailed description with {{ $labels.instance }}"
```

### Modifying Dashboard Panels

1. Import dashboard to Grafana
2. Edit panels as needed
3. Export updated JSON
4. Replace the file in this directory

### Adding New Metrics

1. Configure Jenkins to expose additional metrics
2. Update Prometheus scrape configuration
3. Create new alert rules if needed
4. Add panels to dashboards

## Troubleshooting

### Common Issues

#### 1. No Data in Dashboards
- **Check**: Prometheus is scraping Jenkins metrics endpoint
- **Verify**: Jenkins Prometheus plugin is installed and configured
- **Test**: Access `http://jenkins:8080/prometheus` directly

#### 2. Alerts Not Firing
- **Check**: Prometheus rules are loaded (`/rules` endpoint)
- **Verify**: Alert expressions are correct
- **Test**: Use Prometheus query browser to test expressions

#### 3. Dashboard Import Errors
- **Check**: Grafana version compatibility
- **Verify**: Data source is configured correctly
- **Fix**: Update panel queries if needed

### Debugging Commands

```bash
# Check Prometheus targets
curl http://prometheus:9090/api/v1/targets

# Check loaded rules
curl http://prometheus:9090/api/v1/rules

# Test alert expression
curl -G http://prometheus:9090/api/v1/query \
  --data-urlencode 'query=up{job="jenkins"}'

# Check Jenkins metrics endpoint
curl http://jenkins:8080/prometheus
```

## Maintenance

### Regular Tasks

1. **Weekly**: Review alert thresholds and adjust if needed
2. **Monthly**: Update dashboards based on new requirements
3. **Quarterly**: Review and clean up old metrics and alerts

### Backup

- Export dashboard configurations regularly
- Version control alert rules
- Document any custom modifications

## Integration with CI/CD

### Pipeline Monitoring

Add monitoring checks to your Jenkins pipelines:

```groovy
pipeline {
    agent any
    stages {
        stage('Deploy') {
            steps {
                // Your deployment steps
                script {
                    // Send metrics to Prometheus
                    sh '''
                        echo "deployment_duration_seconds $(date +%s)" | \
                        curl -X POST --data-binary @- \
                        http://prometheus-pushgateway:9091/metrics/job/deployment
                    '''
                }
            }
        }
    }
    post {
        always {
            // Send build metrics
            script {
                def buildResult = currentBuild.result ?: 'SUCCESS'
                sh """
                    echo "jenkins_pipeline_result{job='${env.JOB_NAME}',result='${buildResult}'} 1" | \
                    curl -X POST --data-binary @- \
                    http://prometheus-pushgateway:9091/metrics/job/jenkins-pipeline
                """
            }
        }
    }
}
```

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Prometheus and Grafana documentation
3. Check Jenkins Prometheus plugin documentation
4. Consult your DevOps team

## References

- [Jenkins Prometheus Plugin](https://plugins.jenkins.io/prometheus/)
- [Prometheus Alerting Rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/)
- [Grafana Dashboard Documentation](https://grafana.com/docs/grafana/latest/dashboards/)
- [Jenkins Metrics](https://www.jenkins.io/doc/book/system-administration/monitoring/)