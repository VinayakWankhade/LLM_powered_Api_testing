# Implementation Plan: AI TestGen Backend

## Overview

This implementation plan builds a comprehensive FastAPI-based backend for the AI TestGen platform. The approach follows an incremental development strategy, starting with core infrastructure, then building out each service layer systematically. The implementation prioritizes getting a working end-to-end flow early, then expanding functionality.

## Tasks

- [ ] 1. Set up project infrastructure and core dependencies
  - Initialize FastAPI project structure with proper directory organization
  - Configure PostgreSQL database connection with SQLAlchemy ORM
  - Set up Redis for caching and task queuing
  - Configure Celery for asynchronous task processing
  - Set up environment configuration management
  - Configure logging with structured output
  - Set up pytest testing framework with Hypothesis for property-based testing
  - _Requirements: 13.1, 13.5, 14.4, 15.1, 15.4_

- [ ]* 1.1 Write property test for database connection pooling
  - **Property 33: Database transactions are atomic**
  - **Validates: Requirements 13.2**

- [ ] 2. Implement authentication and authorization system
  - [ ] 2.1 Create User model and database schema
    - Define User table with all required fields (id, email, password_hash, first_name, last_name, role, timestamps)
    - Implement password hashing using bcrypt
    - Add unique constraint on email field
    - _Requirements: 1.1_

  - [ ]* 2.2 Write property test for user registration
    - **Property 1: User registration creates valid accounts**
    - **Validates: Requirements 1.1**

  - [ ] 2.3 Implement JWT token generation and validation
    - Create token generation function with 24-hour expiration
    - Implement token verification middleware
    - Add token refresh endpoint
    - Store token blacklist in Redis for logout functionality
    - _Requirements: 1.2, 1.4, 1.5_

  - [ ]* 2.4 Write property test for token lifecycle
    - **Property 2: Token lifecycle correctness**
    - **Validates: Requirements 1.2, 1.4, 1.5**

  - [ ] 2.5 Implement authentication endpoints
    - POST /api/auth/register - User registration
    - POST /api/auth/login - User login
    - POST /api/auth/refresh - Token refresh
    - GET /api/auth/verify - Token verification
    - _Requirements: 1.1, 1.2, 1.4_

  - [ ]* 2.6 Write unit tests for authentication endpoints
    - Test registration with valid and invalid data
    - Test login with correct and incorrect credentials
    - Test token verification with valid, expired, and invalid tokens
    - _Requirements: 1.1, 1.2, 1.4, 1.5_

  - [ ] 2.7 Implement password reset flow
    - Create password reset token generation
    - Implement email sending service integration
    - Add POST /api/auth/reset-password endpoint
    - Add POST /api/auth/confirm-reset endpoint
    - _Requirements: 1.3_

  - [ ]* 2.8 Write property test for password reset
    - **Property 3: Password reset generates secure tokens**
    - **Validates: Requirements 1.3**

- [ ] 3. Checkpoint - Ensure authentication tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement project management service
  - [ ] 4.1 Create Project model and database schema
    - Define Project table with all required fields
    - Set up foreign key relationship to User
    - Add indexes on owner_id and status fields
    - _Requirements: 2.1_

  - [ ] 4.2 Implement project CRUD operations
    - Create ProjectService class with create, read, update, delete methods
    - Implement cascade delete for associated endpoints, test cases, and test runs
    - Add project listing with filtering and pagination
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 4.3 Write property test for project CRUD operations
    - **Property 4: Project CRUD operations maintain consistency**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 13.6**

  - [ ] 4.4 Implement project statistics aggregation
    - Calculate endpoint count, test coverage, and recent test runs
    - Cache statistics in Redis with TTL
    - _Requirements: 2.5_

  - [ ] 4.5 Implement project API endpoints
    - GET /api/projects - List projects
    - POST /api/projects - Create project
    - GET /api/projects/:id - Get project details
    - PATCH /api/projects/:id - Update project
    - DELETE /api/projects/:id - Delete project
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 4.6 Write property test for project status transitions
    - **Property 5: Project status transitions are valid**
    - **Validates: Requirements 2.6**

- [ ] 5. Implement API endpoint models and basic scanning
  - [ ] 5.1 Create Endpoint model and database schema
    - Define Endpoint table with method, path, parameters, schemas
    - Set up foreign key relationship to Project
    - Add indexes on project_id and status fields
    - _Requirements: 3.3, 3.4_

  - [ ] 5.2 Create ScanJob model for tracking scan progress
    - Define ScanJob table with status, progress, error tracking
    - Set up foreign key relationship to Project
    - _Requirements: 3.1_

  - [ ] 5.3 Implement basic code scanner for Express.js
    - Create parser to extract route definitions from Express code
    - Extract HTTP method, path, and basic metadata
    - Persist discovered endpoints to database
    - _Requirements: 3.2, 3.3, 3.7_

  - [ ]* 5.4 Write property test for endpoint discovery
    - **Property 6: Repository scanning discovers all endpoints**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [ ] 5.5 Implement scan API endpoints
    - POST /api/projects/:id/endpoints/scan - Trigger scan
    - GET /api/projects/:id/endpoints - List endpoints
    - GET /api/projects/:id/endpoints/:eid - Get endpoint details
    - _Requirements: 3.1, 3.4_

  - [ ]* 5.6 Write property test for scan error handling
    - **Property 7: Scan error handling preserves system state**
    - **Validates: Requirements 3.5**

- [ ] 6. Checkpoint - Ensure scanning tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement test case models and management
  - [ ] 7.1 Create TestCase model and database schema
    - Define TestCase table with all required fields
    - Set up foreign key relationship to Endpoint
    - Implement unique ID generation in format "TC-XXXXX"
    - _Requirements: 5.6_

  - [ ]* 7.2 Write property test for test case ID format
    - **Property 10: Generated tests have correct initial state**
    - **Validates: Requirements 4.6, 5.6**

  - [ ] 7.3 Implement test case CRUD operations
    - Create TestCaseService with create, read, update, delete methods
    - Implement filtering by status, priority, and type
    - Add bulk approve and delete operations
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7_

  - [ ]* 7.4 Write property test for test case filtering
    - **Property 13: Test case filtering is accurate**
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 7.5 Write property test for test case state transitions
    - **Property 14: Test case state transitions are valid**
    - **Validates: Requirements 5.3, 5.4, 5.5**

  - [ ] 7.6 Implement test case API endpoints
    - GET /api/projects/:id/test-cases - List test cases
    - GET /api/projects/:id/test-cases/:tid - Get test case details
    - PATCH /api/projects/:id/test-cases/:tid - Update test case
    - DELETE /api/projects/:id/test-cases/:tid - Delete test case
    - POST /api/projects/:id/test-cases/bulk-approve - Bulk approve
    - POST /api/projects/:id/test-cases/bulk-delete - Bulk delete
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.7_

  - [ ]* 7.7 Write property test for bulk operations
    - **Property 15: Bulk operations affect all selected items**
    - **Validates: Requirements 5.7**

- [ ] 8. Implement AI test generation service
  - [ ] 8.1 Create GenerationJob model for tracking generation progress
    - Define GenerationJob table with status, progress, config
    - Set up foreign key relationship to Project
    - _Requirements: 4.1_

  - [ ] 8.2 Implement LLM client abstraction
    - Create base LLMClient interface
    - Implement OpenAI client
    - Implement Anthropic (Claude) client
    - Implement Google (Gemini) client
    - Implement Meta (Llama) client via API
    - Add retry logic with exponential backoff
    - _Requirements: 4.7_

  - [ ] 8.3 Implement test generation prompt templates
    - Create prompt template for functional tests
    - Create prompt template for security tests
    - Create prompt template for performance tests
    - Add support for user instructions in prompts
    - _Requirements: 4.3, 4.4, 4.5, 4.8_

  - [ ] 8.4 Implement test generation Celery task
    - Create async task to generate tests for endpoints
    - Generate functional, security, and performance tests
    - Assign priority based on risk assessment
    - Persist generated test cases with status "Draft"
    - Update GenerationJob progress
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 8.5 Write property test for comprehensive test generation
    - **Property 9: Test generation creates comprehensive test suites**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**

  - [ ]* 8.6 Write property test for asynchronous job creation
    - **Property 11: Test generation jobs are asynchronous**
    - **Validates: Requirements 4.1**

  - [ ] 8.7 Implement test generation API endpoints
    - POST /api/projects/:id/tests/generate - Trigger generation
    - GET /api/projects/:id/tests/generate/:jobId - Get generation status
    - _Requirements: 4.1_

  - [ ]* 8.8 Write property test for user instructions
    - **Property 12: User instructions influence generation**
    - **Validates: Requirements 4.8**

- [ ] 9. Checkpoint - Ensure test generation tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement test execution service
  - [ ] 10.1 Create TestRun and TestResult models
    - Define TestRun table with all required fields
    - Define TestResult table linking runs to test cases
    - Implement unique ID generation in format "run_XXXXX"
    - Set up foreign key relationships
    - _Requirements: 6.1, 6.8_

  - [ ]* 10.2 Write property test for test run ID format
    - **Property 17: Test run IDs are unique and formatted correctly**
    - **Validates: Requirements 6.8**

  - [ ] 10.3 Implement test execution engine
    - Create HTTP client for making API requests
    - Implement test case code execution
    - Capture test results (pass/fail, duration, error details)
    - Support parallel execution with concurrency limits
    - _Requirements: 6.2, 6.3, 6.4, 6.7, 15.3_

  - [ ]* 10.4 Write property test for test run lifecycle
    - **Property 16: Test run lifecycle is correct**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

  - [ ] 10.5 Implement test run Celery task
    - Create async task to execute test runs
    - Update run status throughout execution
    - Calculate pass rate, fail count, and duration
    - Determine final status (Success/Failed/Partial)
    - _Requirements: 6.1, 6.5, 6.6_

  - [ ] 10.6 Implement test execution API endpoints
    - POST /api/projects/:id/runs - Create and execute test run
    - GET /api/projects/:id/runs - List test runs
    - GET /api/projects/:id/runs/:rid - Get run details
    - GET /api/projects/:id/runs/:rid/results - Get test results
    - _Requirements: 6.1_

  - [ ]* 10.7 Write property test for parallel execution
    - **Property 18: Parallel execution reduces duration**
    - **Validates: Requirements 6.7**

  - [ ]* 10.8 Write property test for concurrency limits
    - **Property 37: Concurrency limits prevent resource exhaustion**
    - **Validates: Requirements 15.3**

- [ ] 11. Implement self-healing service
  - [ ] 11.1 Create HealingLog model for tracking healing actions
    - Define HealingLog table with change tracking
    - Set up foreign key relationships to TestCase and TestResult
    - _Requirements: 7.4_

  - [ ] 11.2 Implement failure analysis logic
    - Detect path changes by comparing endpoint paths
    - Detect schema changes by comparing response structures
    - Identify root cause of test failures
    - _Requirements: 7.1_

  - [ ] 11.3 Implement test case healing logic
    - Update test case path when endpoint path changes
    - Update assertions when response schema changes
    - Log healing actions with old and new values
    - Mark unhealable tests for manual review
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

  - [ ]* 11.4 Write property test for self-healing
    - **Property 19: Self-healing adapts to API changes**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

  - [ ]* 11.5 Write property test for unhealable tests
    - **Property 20: Unhealable tests are marked for review**
    - **Validates: Requirements 7.5**

  - [ ] 11.6 Implement healing metrics calculation
    - Calculate healing success rate per project
    - Track healed count separately in test runs
    - _Requirements: 7.6, 7.7_

  - [ ]* 11.7 Write property test for healing metrics
    - **Property 21: Healing metrics are accurate**
    - **Validates: Requirements 7.6, 7.7**

- [ ] 12. Checkpoint - Ensure self-healing tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement coverage analysis service
  - [ ] 13.1 Implement coverage calculation logic
    - Calculate percentage of endpoints with approved tests
    - Identify untested endpoints
    - Break down coverage by HTTP method
    - Break down coverage by test type
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

  - [ ]* 13.2 Write property test for coverage calculation
    - **Property 22: Coverage calculation is comprehensive**
    - **Validates: Requirements 8.1, 8.2, 8.4, 8.5**

  - [ ] 13.3 Implement test run coverage analysis
    - Identify which endpoints were tested in a run
    - Identify which endpoints were skipped
    - _Requirements: 8.3_

  - [ ]* 13.4 Write property test for test run coverage
    - **Property 23: Test run coverage is accurate**
    - **Validates: Requirements 8.3**

  - [ ] 13.5 Implement coverage threshold warnings
    - Check coverage against configured threshold
    - Flag projects with warning status when below threshold
    - _Requirements: 8.6_

  - [ ]* 13.6 Write property test for coverage warnings
    - **Property 24: Low coverage triggers warnings**
    - **Validates: Requirements 8.6**

  - [ ] 13.7 Implement coverage API endpoints
    - GET /api/projects/:id/coverage - Get project coverage
    - GET /api/projects/:id/runs/:rid/coverage - Get run coverage
    - _Requirements: 8.1, 8.3_

- [ ] 14. Implement analytics service
  - [ ] 14.1 Implement dashboard statistics aggregation
    - Aggregate metrics across all user projects
    - Calculate total projects, average coverage, total tests
    - Cache results in Redis with TTL
    - _Requirements: 9.1, 9.2_

  - [ ]* 14.2 Write property test for dashboard aggregation
    - **Property 25: Dashboard aggregation is correct**
    - **Validates: Requirements 9.1, 9.2**

  - [ ] 14.3 Implement trend analysis
    - Query historical data for pass rate, coverage, healing rate
    - Calculate test execution duration trends
    - Return time-series data for specified time range
    - _Requirements: 9.3, 9.4_

  - [ ]* 14.4 Write property test for trend analysis
    - **Property 26: Trend analysis provides historical data**
    - **Validates: Requirements 9.3, 9.4**

  - [ ] 14.5 Implement project comparison
    - Calculate relative performance metrics for multiple projects
    - Support comparison across all standard metrics
    - _Requirements: 9.5_

  - [ ]* 14.6 Write property test for project comparison
    - **Property 27: Project comparison is accurate**
    - **Validates: Requirements 9.5**

  - [ ] 14.7 Implement RL optimization tracking
    - Track optimization gains and efficiency improvements
    - Generate AI insights for anomalous trends
    - _Requirements: 9.6, 9.7_

  - [ ]* 14.8 Write property test for RL tracking
    - **Property 28: RL optimization tracking is complete**
    - **Validates: Requirements 9.6, 9.7**

  - [ ] 14.9 Implement analytics API endpoints
    - GET /api/dashboard/stats - Dashboard statistics
    - GET /api/analytics/global - Global coverage
    - GET /api/analytics/trends - Trend analysis
    - GET /api/analytics/compare - Project comparison
    - GET /api/analytics/rl-insights - RL insights
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 15. Implement API key management
  - [ ] 15.1 Create APIKey model and database schema
    - Define APIKey table with all required fields
    - Set up foreign key relationship to User
    - _Requirements: 10.1_

  - [ ] 15.2 Implement API key generation and validation
    - Generate unique keys with prefix "ak_"
    - Hash keys before storage
    - Implement key validation middleware
    - Track last used timestamp
    - _Requirements: 10.1, 10.3, 10.5_

  - [ ]* 15.3 Write property test for API key lifecycle
    - **Property 29: API key lifecycle is secure**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**

  - [ ] 15.4 Implement API key endpoints
    - GET /api/user/api-keys - List API keys
    - POST /api/user/api-keys - Create API key
    - DELETE /api/user/api-keys/:id - Revoke API key
    - _Requirements: 10.1, 10.2, 10.4_

- [ ] 16. Implement WebSocket real-time updates
  - [ ] 16.1 Set up WebSocket connection management
    - Implement WebSocket endpoint
    - Handle connection lifecycle (connect, disconnect)
    - Support project-specific subscriptions
    - _Requirements: 11.4, 11.5_

  - [ ] 16.2 Implement event broadcasting
    - Broadcast scan progress updates
    - Broadcast test run status updates
    - Broadcast test result events
    - Use Redis pub/sub for multi-instance support
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ]* 16.3 Write property test for WebSocket events
    - **Property 30: WebSocket events are broadcast correctly**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

- [ ] 17. Implement Git integration
  - [ ] 17.1 Implement Git repository operations
    - Clone repositories using provided credentials
    - Checkout specified branch
    - Validate repository access
    - _Requirements: 12.1, 12.5_

  - [ ] 17.2 Implement webhook management
    - Register webhooks with Git providers (GitHub, GitLab, Bitbucket)
    - Handle webhook push events
    - Trigger automatic rescans on push
    - _Requirements: 12.2, 12.3_

  - [ ]* 17.3 Write property test for Git integration
    - **Property 31: Git integration validates and responds to changes**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.5**

  - [ ] 17.4 Implement credential encryption
    - Encrypt Git credentials before storage
    - Decrypt credentials for Git operations
    - _Requirements: 12.6_

  - [ ]* 17.5 Write property test for credential encryption
    - **Property 32: Git credentials are encrypted**
    - **Validates: Requirements 12.6**

- [ ] 18. Implement comprehensive error handling
  - [ ] 18.1 Create error response format and error codes
    - Define consistent error response structure
    - Create error code constants for all error types
    - _Requirements: 14.2_

  - [ ] 18.2 Implement error logging
    - Log all errors with timestamp, user context, stack trace
    - Log all API requests with method, path, status, duration
    - Send alerts for critical errors
    - _Requirements: 14.1, 14.3, 14.6_

  - [ ]* 18.3 Write property test for error logging
    - **Property 35: Comprehensive error logging**
    - **Validates: Requirements 14.1, 14.2, 14.6**

  - [ ]* 18.4 Write property test for request logging
    - **Property 36: Request logging is complete**
    - **Validates: Requirements 14.3**

  - [ ] 18.5 Implement global exception handlers
    - Handle validation errors (400)
    - Handle authentication errors (401)
    - Handle authorization errors (403)
    - Handle not found errors (404)
    - Handle conflict errors (409)
    - Handle rate limit errors (429)
    - Handle server errors (500)
    - _Requirements: 14.2_

- [ ] 19. Implement performance optimizations
  - [ ] 19.1 Implement caching strategy
    - Cache project statistics in Redis
    - Cache dashboard metrics in Redis
    - Set appropriate TTLs for cached data
    - _Requirements: 15.4_

  - [ ] 19.2 Implement rate limiting
    - Add rate limiting middleware
    - Configure limits per endpoint
    - Return 429 with retry-after header
    - _Requirements: 15.6_

  - [ ]* 19.3 Write property test for rate limiting
    - **Property 39: Rate limiting prevents abuse**
    - **Validates: Requirements 15.6**

  - [ ] 19.4 Implement performance monitoring
    - Log warnings for requests exceeding 2 seconds
    - Track response time metrics
    - _Requirements: 15.5_

  - [ ]* 19.5 Write property test for performance warnings
    - **Property 38: Performance warnings for slow requests**
    - **Validates: Requirements 15.5**

- [ ] 20. Implement additional framework scanners
  - [ ] 20.1 Implement FastAPI scanner
    - Parse FastAPI route decorators
    - Extract endpoint metadata from FastAPI apps
    - _Requirements: 3.7_

  - [ ] 20.2 Implement Flask scanner
    - Parse Flask route decorators
    - Extract endpoint metadata from Flask apps
    - _Requirements: 3.7_

  - [ ] 20.3 Implement Django scanner
    - Parse Django URL patterns
    - Extract endpoint metadata from Django views
    - _Requirements: 3.7_

  - [ ] 20.4 Implement Spring Boot scanner
    - Parse Spring annotations (@GetMapping, @PostMapping, etc.)
    - Extract endpoint metadata from Spring controllers
    - _Requirements: 3.7_

  - [ ] 20.5 Implement Fastify scanner
    - Parse Fastify route definitions
    - Extract endpoint metadata from Fastify apps
    - _Requirements: 3.7_

- [ ] 21. Implement OpenAPI spec parsing
  - [ ] 21.1 Implement OpenAPI/Swagger parser
    - Parse OpenAPI 3.0 specifications
    - Parse Swagger 2.0 specifications
    - Extract all endpoint definitions with complete metadata
    - _Requirements: 3.6_

  - [ ]* 21.2 Write property test for OpenAPI parsing
    - **Property 8: OpenAPI spec parsing is complete**
    - **Validates: Requirements 3.6**

- [ ] 22. Implement OAuth integration
  - [ ] 22.1 Implement GitHub OAuth
    - Add GitHub OAuth callback endpoint
    - Exchange authorization code for access token
    - Fetch user profile from GitHub
    - Create or link user account
    - _Requirements: 1.6_

  - [ ] 22.2 Implement Google OAuth
    - Add Google OAuth callback endpoint
    - Exchange authorization code for access token
    - Fetch user profile from Google
    - Create or link user account
    - _Requirements: 1.6_

- [ ] 23. Implement database migrations
  - [ ] 23.1 Set up Alembic for database migrations
    - Initialize Alembic configuration
    - Create initial migration for all models
    - _Requirements: 13.1_

  - [ ] 23.2 Create migration scripts
    - Generate migration for each model addition/change
    - Test migrations up and down
    - _Requirements: 13.1_

- [ ] 24. Final checkpoint - Integration testing
  - [ ] 24.1 Write integration tests for complete workflows
    - Test complete user registration and login flow
    - Test complete project creation and scanning flow
    - Test complete test generation and execution flow
    - Test complete self-healing flow
    - _Requirements: All_

  - [ ] 24.2 Write end-to-end API tests
    - Test all API endpoints with valid and invalid inputs
    - Test authentication and authorization on all protected endpoints
    - Test error responses for all error scenarios
    - _Requirements: All_

  - [ ] 24.3 Performance testing
    - Test system under load with multiple concurrent users
    - Test parallel test execution performance
    - Verify rate limiting works under load
    - _Requirements: 15.3, 15.6_

  - [ ] 24.4 Security testing
    - Test SQL injection prevention
    - Test XSS prevention
    - Test authentication bypass attempts
    - Test authorization enforcement
    - _Requirements: 4.4_

- [ ] 25. Documentation and deployment preparation
  - [ ] 25.1 Write API documentation
    - Document all endpoints with OpenAPI/Swagger
    - Include request/response examples
    - Document authentication requirements
    - _Requirements: All_

  - [ ] 25.2 Create deployment configuration
    - Create Docker configuration for all services
    - Create docker-compose for local development
    - Document environment variables
    - Create deployment guide
    - _Requirements: All_

  - [ ] 25.3 Set up CI/CD pipeline
    - Configure automated testing on pull requests
    - Configure code coverage reporting
    - Configure automated deployment
    - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows
