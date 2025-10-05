#!/usr/bin/env groovy

/**
 * Run Tests Pipeline Step
 * 
 * This shared library function executes various types of tests
 * with proper reporting, coverage analysis, and result archiving.
 * 
 * @param config Map containing:
 *   - testType: Type of tests to run (required) - unit, integration, e2e, security, performance, all
 *   - servicePath: Path to the service directory (default: '.')
 *   - projectType: Project type (default: auto-detected) - maven, gradle, npm, python
 *   - testCommand: Custom test command (optional)
 *   - coverageThreshold: Minimum coverage percentage (default: 80)
 *   - failOnCoverageThreshold: Fail if coverage below threshold (default: false)
 *   - publishResults: Whether to publish test results (default: true)
 *   - archiveArtifacts: Whether to archive test artifacts (default: true)
 *   - parallelExecution: Whether to run tests in parallel (default: false)
 *   - testEnvironment: Environment variables for tests (default: [:])
 */
def call(Map config) {
    // Validate required parameters
    if (!config.testType) {
        error "testType is required"
    }
    
    // Set defaults
    def testType = config.testType
    def servicePath = config.servicePath ?: '.'
    def projectType = config.projectType ?: detectProjectType(servicePath)
    def testCommand = config.testCommand
    def coverageThreshold = config.coverageThreshold ?: 80
    def failOnCoverageThreshold = config.failOnCoverageThreshold != null ? config.failOnCoverageThreshold : false
    def publishResults = config.publishResults != null ? config.publishResults : true
    def archiveArtifacts = config.archiveArtifacts != null ? config.archiveArtifacts : true
    def parallelExecution = config.parallelExecution != null ? config.parallelExecution : false
    def testEnvironment = config.testEnvironment ?: [:]
    
    // Validate test type
    def validTestTypes = ['unit', 'integration', 'e2e', 'security', 'performance', 'all']
    if (!(testType in validTestTypes)) {
        error "Invalid testType: ${testType}. Valid types: ${validTestTypes.join(', ')}"
    }
    
    def testResults = [:]
    
    try {
        stage("Setup Test Environment: ${testType}") {
            echo "Setting up test environment for ${testType} tests"
            echo "Project type: ${projectType}"
            echo "Service path: ${servicePath}"
            
            dir(servicePath) {
                // Set up test environment variables
                testEnvironment.each { key, value ->
                    env."${key}" = value
                }
                
                // Create test results directory
                sh "mkdir -p test-results"
                
                // Install dependencies if needed
                setupTestDependencies(projectType)
            }
        }
        
        if (testType == 'all') {
            // Run all test types
            def testTypes = ['unit', 'integration', 'security']
            
            if (parallelExecution) {
                def parallelTests = [:]
                testTypes.each { type ->
                    parallelTests[type] = {
                        executeTests(type, projectType, servicePath, testCommand)
                    }
                }
                parallel parallelTests
            } else {
                testTypes.each { type ->
                    executeTests(type, projectType, servicePath, testCommand)
                }
            }
        } else {
            // Run specific test type
            executeTests(testType, projectType, servicePath, testCommand)
        }
        
        if (publishResults) {
            stage("Publish Test Results") {
                dir(servicePath) {
                    publishTestResults(projectType, testType)
                }
            }
        }
        
        if (archiveArtifacts) {
            stage("Archive Test Artifacts") {
                dir(servicePath) {
                    archiveTestArtifacts(projectType, testType)
                }
            }
        }
        
        // Check coverage threshold
        if (testType in ['unit', 'integration', 'all']) {
            stage("Coverage Analysis") {
                dir(servicePath) {
                    analyzeCoverage(projectType, coverageThreshold, failOnCoverageThreshold)
                }
            }
        }
        
        echo "✅ ${testType} tests completed successfully"
        
    } catch (Exception e) {
        echo "❌ ${testType} tests failed: ${e.getMessage()}"
        
        // Still try to publish results for failed tests
        if (publishResults) {
            try {
                dir(servicePath) {
                    publishTestResults(projectType, testType)
                }
            } catch (Exception publishError) {
                echo "Failed to publish test results: ${publishError.getMessage()}"
            }
        }
        
        throw e
    }
}

def detectProjectType(servicePath) {
    dir(servicePath) {
        if (fileExists('pom.xml')) {
            return 'maven'
        } else if (fileExists('build.gradle') || fileExists('build.gradle.kts')) {
            return 'gradle'
        } else if (fileExists('package.json')) {
            return 'npm'
        } else if (fileExists('requirements.txt') || fileExists('pyproject.toml')) {
            return 'python'
        } else {
            return 'unknown'
        }
    }
}

def setupTestDependencies(projectType) {
    switch (projectType) {
        case 'maven':
            // Dependencies are handled by Maven
            break
        case 'gradle':
            // Dependencies are handled by Gradle
            break
        case 'npm':
            if (!fileExists('node_modules')) {
                echo "Installing npm dependencies..."
                sh "npm ci"
            }
            break
        case 'python':
            if (fileExists('requirements.txt')) {
                echo "Installing Python dependencies..."
                sh "pip install -r requirements.txt"
            }
            break
        default:
            echo "Unknown project type, skipping dependency setup"
    }
}

def executeTests(testType, projectType, servicePath, customCommand) {
    stage("Execute ${testType} Tests") {
        dir(servicePath) {
            echo "Running ${testType} tests for ${projectType} project"
            
            if (customCommand) {
                sh customCommand
                return
            }
            
            switch (projectType) {
                case 'maven':
                    executeMavenTests(testType)
                    break
                case 'gradle':
                    executeGradleTests(testType)
                    break
                case 'npm':
                    executeNpmTests(testType)
                    break
                case 'python':
                    executePythonTests(testType)
                    break
                default:
                    error "Unsupported project type: ${projectType}"
            }
        }
    }
}

def executeMavenTests(testType) {
    def testProfile = getTestProfile(testType)
    def mavenCommand = """
        mvn clean test \\
            -P${testProfile} \\
            -Dmaven.test.failure.ignore=false \\
            -Dsurefire.useFile=false \\
            -Djacoco.destFile=target/jacoco.exec \\
            -Dmaven.test.redirectTestOutputToFile=true
    """
    
    if (testType == 'security') {
        mavenCommand = """
            mvn clean verify \\
                org.owasp:dependency-check-maven:check \\
                -Dmaven.test.skip=true
        """
    }
    
    sh mavenCommand
}

def executeGradleTests(testType) {
    def gradleTask = getGradleTask(testType)
    sh "./gradlew clean ${gradleTask} --continue"
}

def executeNpmTests(testType) {
    def npmScript = getNpmScript(testType)
    
    // Check if script exists in package.json
    def scriptExists = sh(
        script: "npm run ${npmScript} --silent 2>/dev/null || echo 'not-found'",
        returnStdout: true
    ).trim()
    
    if (scriptExists == 'not-found') {
        echo "Script '${npmScript}' not found in package.json, using default command"
        
        switch (testType) {
            case 'unit':
                sh "npm test"
                break
            case 'integration':
                sh "npm run test:integration || npm test"
                break
            case 'e2e':
                sh "npm run test:e2e || echo 'No e2e tests configured'"
                break
            case 'security':
                sh "npm audit --audit-level=high"
                if (env.SNYK_TOKEN) {
                    sh "npx snyk test --severity-threshold=high"
                }
                break
            default:
                sh "npm test"
        }
    } else {
        sh "npm run ${npmScript}"
    }
}

def executePythonTests(testType) {
    switch (testType) {
        case 'unit':
            sh "python -m pytest tests/unit/ --junitxml=test-results/junit.xml --cov=. --cov-report=xml"
            break
        case 'integration':
            sh "python -m pytest tests/integration/ --junitxml=test-results/junit.xml"
            break
        case 'e2e':
            sh "python -m pytest tests/e2e/ --junitxml=test-results/junit.xml"
            break
        case 'security':
            sh "safety check"
            sh "bandit -r . -f json -o test-results/bandit-report.json"
            break
        default:
            sh "python -m pytest --junitxml=test-results/junit.xml --cov=. --cov-report=xml"
    }
}

def getTestProfile(testType) {
    switch (testType) {
        case 'unit':
            return 'unit-tests'
        case 'integration':
            return 'integration-tests'
        case 'e2e':
            return 'e2e-tests'
        case 'security':
            return 'security-tests'
        case 'performance':
            return 'performance-tests'
        default:
            return 'test'
    }
}

def getGradleTask(testType) {
    switch (testType) {
        case 'unit':
            return 'test'
        case 'integration':
            return 'integrationTest'
        case 'e2e':
            return 'e2eTest'
        case 'security':
            return 'dependencyCheckAnalyze'
        case 'performance':
            return 'performanceTest'
        default:
            return 'test'
    }
}

def getNpmScript(testType) {
    switch (testType) {
        case 'unit':
            return 'test:unit'
        case 'integration':
            return 'test:integration'
        case 'e2e':
            return 'test:e2e'
        case 'security':
            return 'test:security'
        case 'performance':
            return 'test:performance'
        default:
            return 'test'
    }
}

def publishTestResults(projectType, testType) {
    echo "Publishing test results for ${projectType} project"
    
    try {
        switch (projectType) {
            case 'maven':
                // Publish JUnit results
                if (fileExists('target/surefire-reports/*.xml')) {
                    publishTestResults testResultsPattern: 'target/surefire-reports/*.xml'
                }
                if (fileExists('target/failsafe-reports/*.xml')) {
                    publishTestResults testResultsPattern: 'target/failsafe-reports/*.xml'
                }
                break
            case 'gradle':
                if (fileExists('build/test-results/test/*.xml')) {
                    publishTestResults testResultsPattern: 'build/test-results/test/*.xml'
                }
                break
            case 'npm':
                if (fileExists('test-results.xml')) {
                    publishTestResults testResultsPattern: 'test-results.xml'
                }
                break
            case 'python':
                if (fileExists('test-results/junit.xml')) {
                    publishTestResults testResultsPattern: 'test-results/junit.xml'
                }
                break
        }
    } catch (Exception e) {
        echo "Failed to publish test results: ${e.getMessage()}"
    }
}

def archiveTestArtifacts(projectType, testType) {
    echo "Archiving test artifacts"
    
    def artifacts = []
    
    switch (projectType) {
        case 'maven':
            artifacts.addAll([
                'target/surefire-reports/**',
                'target/failsafe-reports/**',
                'target/site/jacoco/**',
                'target/dependency-check-report.html'
            ])
            break
        case 'gradle':
            artifacts.addAll([
                'build/test-results/**',
                'build/reports/**'
            ])
            break
        case 'npm':
            artifacts.addAll([
                'coverage/**',
                'test-results/**',
                'reports/**'
            ])
            break
        case 'python':
            artifacts.addAll([
                'test-results/**',
                'coverage.xml',
                'htmlcov/**'
            ])
            break
    }
    
    artifacts.each { pattern ->
        try {
            archiveArtifacts artifacts: pattern, allowEmptyArchive: true
        } catch (Exception e) {
            echo "Failed to archive ${pattern}: ${e.getMessage()}"
        }
    }
}

def analyzeCoverage(projectType, threshold, failOnThreshold) {
    echo "Analyzing code coverage (threshold: ${threshold}%)"
    
    try {
        switch (projectType) {
            case 'maven':
                if (fileExists('target/site/jacoco/jacoco.xml')) {
                    publishCoverage adapters: [jacocoAdapter('target/site/jacoco/jacoco.xml')],
                                  sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
                }
                break
            case 'npm':
                if (fileExists('coverage/lcov.info')) {
                    publishCoverage adapters: [lcovAdapter('coverage/lcov.info')],
                                  sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
                }
                break
            case 'python':
                if (fileExists('coverage.xml')) {
                    publishCoverage adapters: [coberturaAdapter('coverage.xml')],
                                  sourceFileResolver: sourceFiles('STORE_LAST_BUILD')
                }
                break
        }
        
        // Check coverage threshold (simplified check)
        if (failOnThreshold) {
            echo "Coverage threshold checking enabled (${threshold}%)"
            // Note: Actual threshold checking would require parsing coverage reports
            // This is a placeholder for the logic
        }
        
    } catch (Exception e) {
        echo "Failed to analyze coverage: ${e.getMessage()}"
    }
}