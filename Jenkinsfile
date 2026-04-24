pipeline {

  agent {
    label 'nodejs'   // Run on a Jenkins agent with Node.js installed
  }

  // ─── Parameters — selectable from Jenkins UI ─────────────────────────────
  parameters {
    choice(
      name:        'ENVIRONMENT',
      choices:     ['qa', 'staging', 'local'],
      description: 'Target environment for test run'
    )
    choice(
      name:        'TEST_SUITE',
      choices:     ['smoke', 'regression', 'all', 'contract'],
      description: 'Test suite to execute'
    )
    booleanParam(
      name:         'SKIP_TYPECHECK',
      defaultValue: false,
      description:  'Skip TypeScript type check (faster but less safe)'
    )
  }

  // ─── Environment Variables ─────────────────────────────────────────────────
  environment {
    ENV         = "${params.ENVIRONMENT}"
    API_TIMEOUT = '15000'
    RETRY_COUNT = '3'
    LOG_LEVEL   = 'info'
    CI          = 'true'
    NODE_ENV    = 'test'
  }

  // ─── Pipeline Options ──────────────────────────────────────────────────────
  options {
    timeout(time: 60, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
    disableConcurrentBuilds()
    timestamps()
  }

  // ─── Triggers ─────────────────────────────────────────────────────────────
  triggers {
    // Nightly regression at 3:00 AM
    cron(env.BRANCH_NAME == 'main' ? '0 3 * * *' : '')
  }

  stages {

    // ─── Stage 1: Checkout & Setup ──────────────────────────────────────────
    stage('Setup') {
      steps {
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "  Environment : ${params.ENVIRONMENT.toUpperCase()}"
        echo "  Test Suite  : ${params.TEST_SUITE}"
        echo "  Branch      : ${env.BRANCH_NAME}"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        // Install Node dependencies
        sh 'npm ci'

        // Install Playwright (API only — no browser binaries needed)
        sh 'npx playwright install'
      }
    }

    // ─── Stage 2: Type Check ─────────────────────────────────────────────────
    stage('Type Check') {
      when {
        expression { return !params.SKIP_TYPECHECK }
      }
      steps {
        echo 'Running TypeScript type check...'
        sh 'npm run typecheck'
      }
    }

    // ─── Stage 3: Smoke Tests ────────────────────────────────────────────────
    stage('Smoke Tests') {
      steps {
        withCredentials([
          string(credentialsId: 'TEST_USER_EMAIL',    variable: 'TEST_USER_EMAIL'),
          string(credentialsId: 'TEST_USER_PASSWORD', variable: 'TEST_USER_PASSWORD'),
          string(credentialsId: 'NEW_USER_EMAIL',     variable: 'NEW_USER_EMAIL'),
          string(credentialsId: 'NEW_USER_PASSWORD',  variable: 'NEW_USER_PASSWORD'),
        ]) {
          sh '''
            export BASE_URL=https://automationexercise.com
            export NEW_USER_NAME="Jenkins Smoke User"
            npx playwright test --grep @smoke
          '''
        }
      }
      post {
        always {
          // Stash Allure results for combined report
          stash name: 'smoke-allure', includes: 'reports/allure-results/**'
          junit allowEmptyResults: true, testResults: 'reports/junit/results.xml'
        }
      }
    }

    // ─── Stage 4: Regression Tests ───────────────────────────────────────────
    stage('Regression Tests') {
      when {
        anyOf {
          expression { return params.TEST_SUITE == 'regression' }
          expression { return params.TEST_SUITE == 'all' }
          branch 'main'
          branch 'master'
        }
      }
      steps {
        withCredentials([
          string(credentialsId: 'TEST_USER_EMAIL',    variable: 'TEST_USER_EMAIL'),
          string(credentialsId: 'TEST_USER_PASSWORD', variable: 'TEST_USER_PASSWORD'),
          string(credentialsId: 'NEW_USER_EMAIL',     variable: 'NEW_USER_EMAIL'),
          string(credentialsId: 'NEW_USER_PASSWORD',  variable: 'NEW_USER_PASSWORD'),
        ]) {
          sh '''
            export BASE_URL=https://automationexercise.com
            export NEW_USER_NAME="Jenkins Regression User"
            npx playwright test --grep @regression
          '''
        }
      }
      post {
        always {
          stash name: 'regression-allure', includes: 'reports/allure-results/**'
          junit allowEmptyResults: true, testResults: 'reports/junit/results.xml'
        }
      }
    }

    // ─── Stage 5: Contract Tests ─────────────────────────────────────────────
    stage('Contract Tests') {
      when {
        anyOf {
          expression { return params.TEST_SUITE == 'contract' }
          expression { return params.TEST_SUITE == 'all' }
          branch 'main'
          branch 'master'
        }
      }
      steps {
        withCredentials([
          string(credentialsId: 'TEST_USER_EMAIL',    variable: 'TEST_USER_EMAIL'),
          string(credentialsId: 'TEST_USER_PASSWORD', variable: 'TEST_USER_PASSWORD'),
          string(credentialsId: 'NEW_USER_EMAIL',     variable: 'NEW_USER_EMAIL'),
          string(credentialsId: 'NEW_USER_PASSWORD',  variable: 'NEW_USER_PASSWORD'),
        ]) {
          sh '''
            export BASE_URL=https://automationexercise.com
            export NEW_USER_NAME="Jenkins Contract User"
            npx playwright test --grep @contract
          '''
        }
      }
      post {
        always {
          stash name: 'contract-allure', includes: 'reports/allure-results/**'
          junit allowEmptyResults: true, testResults: 'reports/junit/results.xml'
        }
      }
    }

    // ─── Stage 6: Generate Allure Report ─────────────────────────────────────
    stage('Generate Report') {
      steps {
        // Unstash all allure results
        script {
          try { unstash 'smoke-allure' }      catch(e) { echo 'No smoke results' }
          try { unstash 'regression-allure' } catch(e) { echo 'No regression results' }
          try { unstash 'contract-allure' }   catch(e) { echo 'No contract results' }
        }

        // Generate Allure HTML report
        allure([
          includeProperties: true,
          jdk:               '',
          properties:        [],
          reportBuildPolicy: 'ALWAYS',
          results:           [[path: 'reports/allure-results']],
        ])
      }
    }

  }

  // ─── Post Pipeline Actions ─────────────────────────────────────────────────
  post {

    always {
      echo 'Pipeline complete — archiving artifacts'

      // Archive logs
      archiveArtifacts(
        artifacts:     'test-results/logs/**',
        allowEmptyArchive: true
      )

      // Archive HTML report
      archiveArtifacts(
        artifacts:     'reports/html/**',
        allowEmptyArchive: true
      )
    }

    success {
      echo "✅ All tests passed — ${params.ENVIRONMENT.toUpperCase()} environment"
    }

    failure {
      echo "❌ Tests failed — check Allure report for details"

      // Archive logs on failure for debugging
      archiveArtifacts(
        artifacts:     'test-results/logs/*.log',
        allowEmptyArchive: true
      )
    }

    unstable {
      echo "⚠️  Tests unstable — some tests may have failed with retries"
    }

  }
}
