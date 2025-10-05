#!/usr/bin/env groovy

/**
 * SonarQube Analysis Pipeline Step
 * 
 * This shared library function performs SonarQube code analysis
 * with quality gate checking and comprehensive reporting.
 * 
 * @param config Map containing:
 *   - projectKey: SonarQube project key (required)
 *   - projectName: SonarQube project name (default: projectKey)
 *   - projectVersion: Project version (default: env.BUILD_NUMBER)
 *   - sources: Source directories (default: auto-detected)
 *   - language: Programming language (default: auto-detected)
 *   - sonarHost: SonarQube server URL (default: env.SONAR_HOST_URL)
 *   - sonarToken: SonarQube token (default: env.SONAR_TOKEN)
 *   - qualityGate: Whether to check quality gate (default: true)
 *   - timeout: Quality gate timeout in seconds (default: 300)
 *   - failOnQualityGate: Whether to fail on quality gate failure (default: true)
 *   - additionalProperties: Additional SonarQube properties (default: [:])
 *   - excludePatterns: Patterns to exclude from analysis (default: [])
 *   - coverageReports: Coverage report paths (default: auto-detected)
 */
def call(Map config) {
    // Validate required parameters
    if (!config.projectKey) {
        error "projectKey is required"
    }
    
    // Set defaults
    def projectKey = config.projectKey
    def projectName = config.projectName ?: projectKey
    def projectVersion = config.projectVersion ?: env.BUILD_NUMBER ?: '1.0.0'
    def sources = config.sources ?: detectSources()
    def language = config.language ?: detectLanguage()
    def sonarHost = config.sonarHost ?: env.SONAR_HOST_URL ?: 'http://sonarqube:9000'
    def sonarToken = config.sonarToken ?: env.SONAR_TOKEN
    def qualityGate = config.qualityGate != null ? config.qualityGate : true
    def timeout = config.timeout ?: 300
    def failOnQualityGate = config.failOnQualityGate != null ? config.failOnQualityGate : true
    def additionalProperties = config.additionalProperties ?: [:]
    def excludePatterns = config.excludePatterns ?: getDefaultExcludePatterns()
    def coverageReports = config.coverageReports ?: detectCoverageReports()
    
    // Validate SonarQube configuration
    if (!sonarToken) {
        error "SonarQube token is required (SONAR_TOKEN environment variable)"
    }
    
    def analysisResult = [:]
    
    try {
        stage("SonarQube Analysis: ${projectKey}") {
            echo "Starting SonarQube analysis for ${projectKey}"
            echo "Project: ${projectName} v${projectVersion}"
            echo "Language: ${language}"
            echo "Sources: ${sources}"
            echo "SonarQube Host: ${sonarHost}"
            
            // Check SonarQube connectivity
            checkSonarQubeConnectivity(sonarHost, sonarToken)
            
            // Build SonarQube properties
            def sonarProperties = buildSonarProperties(
                projectKey, 
                projectName, 
                projectVersion, 
                sources, 
                language, 
                excludePatterns, 
                coverageReports, 
                additionalProperties
            )
            
            // Run SonarQube analysis
            runSonarAnalysis(sonarHost, sonarToken, sonarProperties)
            
            analysisResult.status = 'SUCCESS'
            analysisResult.projectKey = projectKey
            analysisResult.dashboardUrl = "${sonarHost}/dashboard?id=${projectKey}"
        }
        
        if (qualityGate) {
            stage("SonarQube Quality Gate: ${projectKey}") {
                echo "Checking SonarQube quality gate..."
                
                def qualityGateResult = checkQualityGate(
                    projectKey, 
                    sonarHost, 
                    sonarToken, 
                    timeout
                )
                
                analysisResult.qualityGate = qualityGateResult
                
                if (qualityGateResult.status != 'OK' && failOnQualityGate) {
                    error "Quality Gate failed: ${qualityGateResult.status}"
                }
            }
        }
        
        stage("SonarQube Report: ${projectKey}") {
            generateSonarReport(projectKey, sonarHost, sonarToken, analysisResult)
        }
        
        echo "✅ SonarQube analysis completed successfully"
        return analysisResult
        
    } catch (Exception e) {
        echo "❌ SonarQube analysis failed: ${e.getMessage()}"
        analysisResult.status = 'FAILURE'
        analysisResult.error = e.getMessage()
        
        // Still try to generate a report
        try {
            generateSonarReport(projectKey, sonarHost, sonarToken, analysisResult)
        } catch (Exception reportError) {
            echo "Failed to generate SonarQube report: ${reportError.getMessage()}"
        }
        
        throw e
    }
}

def detectSources() {
    def sources = []
    
    // Java/Kotlin sources
    if (fileExists('src/main/java')) {
        sources.add('src/main/java')
    }
    if (fileExists('src/main/kotlin')) {
        sources.add('src/main/kotlin')
    }
    
    // JavaScript/TypeScript sources
    if (fileExists('src')) {
        sources.add('src')
    }
    
    // Python sources
    if (fileExists('app')) {
        sources.add('app')
    }
    if (fileExists('lib')) {
        sources.add('lib')
    }
    
    // Default to current directory if no specific sources found
    if (sources.isEmpty()) {
        sources.add('.')
    }
    
    return sources.join(',')
}

def detectLanguage() {
    if (fileExists('pom.xml') || fileExists('build.gradle')) {
        return 'java'
    } else if (fileExists('package.json')) {
        return 'js'
    } else if (fileExists('requirements.txt') || fileExists('pyproject.toml')) {
        return 'py'
    } else if (fileExists('go.mod')) {
        return 'go'
    } else {
        return 'multi'
    }
}

def getDefaultExcludePatterns() {
    return [
        '**/target/**',
        '**/build/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/*.min.js',
        '**/*.test.js',
        '**/*.spec.js',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/test/**',
        '**/tests/**',
        '**/__tests__/**',
        '**/*.d.ts'
    ]
}

def detectCoverageReports() {
    def reports = []
    
    // Java coverage reports
    if (fileExists('target/site/jacoco/jacoco.xml')) {
        reports.add('target/site/jacoco/jacoco.xml')
    }
    
    // JavaScript coverage reports
    if (fileExists('coverage/lcov.info')) {
        reports.add('coverage/lcov.info')
    }
    if (fileExists('coverage/clover.xml')) {
        reports.add('coverage/clover.xml')
    }
    
    // Python coverage reports
    if (fileExists('coverage.xml')) {
        reports.add('coverage.xml')
    }
    
    return reports.join(',')
}

def buildSonarProperties(projectKey, projectName, projectVersion, sources, language, excludePatterns, coverageReports, additionalProperties) {
    def properties = [
        'sonar.projectKey': projectKey,
        'sonar.projectName': projectName,
        'sonar.projectVersion': projectVersion,
        'sonar.sources': sources,
        'sonar.language': language
    ]
    
    // Add exclusions
    if (excludePatterns) {
        properties['sonar.exclusions'] = excludePatterns.join(',')
    }
    
    // Add coverage reports
    if (coverageReports) {
        switch (language) {
            case 'java':
                properties['sonar.coverage.jacoco.xmlReportPaths'] = coverageReports
                break
            case 'js':
                properties['sonar.javascript.lcov.reportPaths'] = coverageReports
                break
            case 'py':
                properties['sonar.python.coverage.reportPaths'] = coverageReports
                break
        }
    }
    
    // Add Git information
    if (env.GIT_COMMIT) {
        properties['sonar.scm.revision'] = env.GIT_COMMIT
    }
    if (env.BRANCH_NAME) {
        properties['sonar.branch.name'] = env.BRANCH_NAME
    }
    if (env.CHANGE_ID) {
        properties['sonar.pullrequest.key'] = env.CHANGE_ID
        properties['sonar.pullrequest.branch'] = env.CHANGE_BRANCH
        properties['sonar.pullrequest.base'] = env.CHANGE_TARGET
    }
    
    // Add additional properties
    properties.putAll(additionalProperties)
    
    return properties
}

def checkSonarQubeConnectivity(sonarHost, sonarToken) {
    echo "Checking SonarQube connectivity..."
    
    def healthCheck = sh(
        script: """
            curl -s -u ${sonarToken}: \\
                ${sonarHost}/api/system/health \\
                | jq -r '.health'
        """,
        returnStdout: true
    ).trim()
    
    if (healthCheck != 'GREEN') {
        error "SonarQube is not healthy: ${healthCheck}"
    }
    
    echo "✅ SonarQube connectivity verified"
}

def runSonarAnalysis(sonarHost, sonarToken, properties) {
    // Build sonar-scanner command
    def scannerCommand = "sonar-scanner"
    
    // Add server URL and token
    scannerCommand += " -Dsonar.host.url=${sonarHost}"
    scannerCommand += " -Dsonar.login=${sonarToken}"
    
    // Add all properties
    properties.each { key, value ->
        scannerCommand += " -D${key}='${value}'"
    }
    
    // Run the analysis
    sh scannerCommand
}

def checkQualityGate(projectKey, sonarHost, sonarToken, timeout) {
    echo "Waiting for quality gate result..."
    
    def elapsed = 0
    def status = 'IN_PROGRESS'
    
    while (elapsed < timeout && status == 'IN_PROGRESS') {
        sleep(10)
        elapsed += 10
        
        def response = sh(
            script: """
                curl -s -u ${sonarToken}: \\
                    '${sonarHost}/api/qualitygates/project_status?projectKey=${projectKey}'
            """,
            returnStdout: true
        ).trim()
        
        def jsonResponse = readJSON text: response
        status = jsonResponse.projectStatus.status
        
        echo "Quality gate status: ${status} (${elapsed}s elapsed)"
    }
    
    if (elapsed >= timeout) {
        error "Quality gate check timed out after ${timeout} seconds"
    }
    
    // Get detailed quality gate information
    def detailedResponse = sh(
        script: """
            curl -s -u ${sonarToken}: \\
                '${sonarHost}/api/qualitygates/project_status?projectKey=${projectKey}'
        """,
        returnStdout: true
    ).trim()
    
    def qualityGateResult = readJSON text: detailedResponse
    
    echo "Quality Gate Result: ${status}"
    if (qualityGateResult.projectStatus.conditions) {
        qualityGateResult.projectStatus.conditions.each { condition ->
            echo "  ${condition.metricKey}: ${condition.actualValue} ${condition.comparator} ${condition.errorThreshold} (${condition.status})"
        }
    }
    
    return qualityGateResult.projectStatus
}

def generateSonarReport(projectKey, sonarHost, sonarToken, analysisResult) {
    echo "Generating SonarQube report..."
    
    try {
        // Get project metrics
        def metricsResponse = sh(
            script: """
                curl -s -u ${sonarToken}: \\
                    '${sonarHost}/api/measures/component?component=${projectKey}&metricKeys=coverage,duplicated_lines_density,maintainability_rating,reliability_rating,security_rating,sqale_rating,bugs,vulnerabilities,code_smells,ncloc'
            """,
            returnStdout: true
        ).trim()
        
        def metrics = readJSON text: metricsResponse
        
        // Generate HTML report
        def reportContent = generateHtmlReport(projectKey, sonarHost, analysisResult, metrics)
        writeFile file: 'sonarqube-report.html', text: reportContent
        
        // Generate JSON report
        def jsonReport = [
            projectKey: projectKey,
            analysisResult: analysisResult,
            metrics: metrics,
            dashboardUrl: "${sonarHost}/dashboard?id=${projectKey}",
            timestamp: new Date().format('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'')
        ]
        writeFile file: 'sonarqube-report.json', text: groovy.json.JsonBuilder(jsonReport).toPrettyString()
        
        // Archive reports
        archiveArtifacts artifacts: 'sonarqube-report.*', allowEmptyArchive: true
        
        echo "✅ SonarQube report generated successfully"
        
    } catch (Exception e) {
        echo "Failed to generate SonarQube report: ${e.getMessage()}"
    }
}

def generateHtmlReport(projectKey, sonarHost, analysisResult, metrics) {
    def html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>SonarQube Analysis Report - ${projectKey}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background-color: #f5f5f5; padding: 20px; border-radius: 5px; }
            .metrics { display: flex; flex-wrap: wrap; gap: 20px; margin: 20px 0; }
            .metric { background-color: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; min-width: 200px; }
            .metric-value { font-size: 24px; font-weight: bold; color: #333; }
            .metric-label { color: #666; font-size: 14px; }
            .success { color: #28a745; }
            .warning { color: #ffc107; }
            .danger { color: #dc3545; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>SonarQube Analysis Report</h1>
            <p><strong>Project:</strong> ${projectKey}</p>
            <p><strong>Status:</strong> <span class="${analysisResult.status == 'SUCCESS' ? 'success' : 'danger'}">${analysisResult.status}</span></p>
            <p><strong>Dashboard:</strong> <a href="${sonarHost}/dashboard?id=${projectKey}" target="_blank">View in SonarQube</a></p>
        </div>
        
        <div class="metrics">
    """
    
    if (metrics.component?.measures) {
        metrics.component.measures.each { measure ->
            def value = measure.value ?: 'N/A'
            def label = measure.metric
            
            html += """
            <div class="metric">
                <div class="metric-value">${value}</div>
                <div class="metric-label">${label}</div>
            </div>
            """
        }
    }
    
    html += """
        </div>
    </body>
    </html>
    """
    
    return html
}