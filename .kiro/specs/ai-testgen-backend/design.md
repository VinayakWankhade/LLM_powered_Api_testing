# Design Document

## Overview

The AI TestGen Backend is a FastAPI-based REST API service that orchestrates intelligent API testing workflows. The system architecture follows a microservices-inspired design with clear separation of concerns across authentication, project management, API scanning, AI-powered test generation, test execution, and analytics.

The backend integrates with external services including:
- **PostgreSQL** for persistent data storage
- **Redis** for caching and task queuing
- **Celery** for asynchronous job processing
- **LLM APIs** (OpenAI, Anthropic, Google) for test generation
- **Git providers** (GitHub, GitLab, Bitbucket) for repository access
- **WebSocket** for real-time updates

The design prioritizes scalability, maintainability, and extensibility to support future enhancements like additional language support, more sophisticated AI models, and advanced analytics.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST + WebSocket
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth Router  │  │ Projects     │  │ Analytics    │          │
│  │              │  │ Router       │  │ Router       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth Service │  │ Project      │  │ Test         │          │
│  │              │  │ Service      │  │ Service      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Scanner      │  │ AI Engine    │  │ Analytics    │          │
│  │ Service      │  │ Service      │  │ Service      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ PostgreSQL   │  │ Redis Cache  │  │ Celery Queue │          │
│  │ Database     │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   External Services                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ LLM APIs     │  │ Git Providers│  │ Email Service│          │
│  │ (OpenAI,etc) │  │ (GitHub,etc) │  │ (SMTP)       │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Layered Architecture

1. **API Gateway Layer**: FastAPI routers that handle HTTP requests, validate input, and route to appropriate services
2. **Service Layer**: Business logic implementation for each domain (auth, projects, scanning, testing, analytics)
3. **Data Layer**: Database models, repositories, and caching logic
4. **Worker Layer**: Celery workers for asynchronous tasks (scanning, test generation, test execution)
5. **Integration Layer**: Adapters for external services (LLMs, Git, email)

## Components and Interfaces

### 1. Authentication Service

**Responsibilities:**
- User registration and login
- JWT token generation and validation
- Password hashing and verification
- OAuth integration (GitHub, Google)
- API key management

**Key Interfaces:**

```python
class AuthService:
    def register_user(email: str, password: str, first_name: str, last_name: str) -> User
    def authenticate_user(email: str, password: str) -> TokenPair
    def verify_token(token: str) -> User
    def refresh_token(refresh_token: str) -> TokenPair
    def reset_password(email: str) -> None
    def oauth_login(provider: str, code: str) -> TokenPair
    def create_api_key(user_id: str, name: str) -> APIKey
    def revoke_api_key(key_id: str) -> None
```

**Dependencies:**
- PostgreSQL (User table)
- Redis (token blacklist)
- Email service (password reset)
- OAuth providers (GitHub, Google)

### 2. Project Service

**Responsibilities:**
- CRUD operations for projects
- Project statistics aggregation
- Project status management
- Git repository configuration

**Key Interfaces:**

```python
class ProjectService:
    def create_project(user_id: str, data: ProjectCreate) -> Project
    def get_projects(user_id: str, filters: ProjectFilters) -> List[Project]
    def get_project_details(project_id: int) -> ProjectDetails
    def update_project(project_id: int, data: ProjectUpdate) -> Project
    def delete_project(project_id: int) -> None
    def get_project_stats(project_id: int) -> ProjectStats
```

**Dependencies:**
- PostgreSQL (Project, Endpoint, TestCase, TestRun tables)
- Redis (stats caching)

### 3. Scanner Service

**Responsibilities:**
- Clone Git repositories
- Parse code to discover API endpoints
- Extract endpoint metadata (method, path, parameters, responses)
- Support multiple frameworks (Express, FastAPI, Flask, Django, Spring Boot)
- Update endpoint status

**Key Interfaces:**

```python
class ScannerService:
    def scan_repository(project_id: int, repo_url: str, branch: str) -> ScanJob
    def scan_local_path(project_id: int, path: str) -> ScanJob
    def parse_openapi_spec(project_id: int, spec_url: str) -> ScanJob
    def get_scan_status(job_id: str) -> ScanStatus
    def extract_endpoints(code_path: str, framework: str) -> List[EndpointMetadata]
```

**Dependencies:**
- Git client (clone repositories)
- Code parsers (AST analysis for each framework)
- PostgreSQL (Endpoint table)
- Celery (async scanning)

### 4. AI Engine Service

**Responsibilities:**
- Generate test cases using LLMs
- Support multiple LLM providers (OpenAI, Anthropic, Google, Meta)
- Create functional, security, and performance tests
- Incorporate user instructions into prompts
- Estimate test priority and risk

**Key Interfaces:**

```python
class AIEngineService:
    def generate_tests(endpoint_id: int, config: TestGenConfig) -> GenerationJob
    def get_generation_status(job_id: str) -> GenerationStatus
    def generate_functional_tests(endpoint: Endpoint, creativity: float) -> List[TestCase]
    def generate_security_tests(endpoint: Endpoint) -> List[TestCase]
    def generate_performance_tests(endpoint: Endpoint) -> List[TestCase]
    def estimate_test_priority(test_case: TestCase) -> Priority
```

**Dependencies:**
- LLM APIs (OpenAI, Anthropic, Google, Meta)
- PostgreSQL (TestCase table)
- Celery (async generation)
- Redis (rate limiting)

### 5. Test Execution Service

**Responsibilities:**
- Execute test cases against target APIs
- Manage test runs and track progress
- Collect test results and metrics
- Support parallel execution
- Implement self-healing logic

**Key Interfaces:**

```python
class TestExecutionService:
    def create_test_run(project_id: int, test_case_ids: List[str]) -> TestRun
    def execute_test_run(run_id: str) -> None
    def execute_test_case(test_case_id: str, endpoint_url: str) -> TestResult
    def get_run_status(run_id: str) -> RunStatus
    def get_run_results(run_id: str) -> List[TestResult]
    def apply_self_healing(test_case_id: str, failure: TestFailure) -> HealingResult
```

**Dependencies:**
- HTTP client (execute API calls)
- PostgreSQL (TestRun, TestResult tables)
- Celery (async execution)
- WebSocket (real-time updates)

### 6. Self-Healing Service

**Responsibilities:**
- Analyze test failures
- Detect API structure changes
- Update test cases automatically
- Log healing actions
- Calculate healing success rate

**Key Interfaces:**

```python
class SelfHealingService:
    def analyze_failure(test_result: TestResult) -> FailureAnalysis
    def detect_endpoint_changes(endpoint_id: int) -> List[Change]
    def heal_test_case(test_case_id: str, changes: List[Change]) -> HealingResult
    def log_healing_action(test_case_id: str, action: HealingAction) -> None
    def get_healing_rate(project_id: int) -> float
```

**Dependencies:**
- PostgreSQL (TestCase, HealingLog tables)
- AI Engine (analyze failures)

### 7. Analytics Service

**Responsibilities:**
- Calculate coverage metrics
- Generate trend reports
- Aggregate global statistics
- Provide project comparisons
- Track RL optimization gains

**Key Interfaces:**

```python
class AnalyticsService:
    def get_dashboard_stats(user_id: str) -> DashboardStats
    def get_global_coverage() -> GlobalCoverage
    def get_coverage_report(project_id: int) -> CoverageReport
    def get_trend_analysis(project_id: int, time_range: str) -> TrendData
    def get_rl_insights(project_id: int) -> RLInsights
    def compare_projects(project_ids: List[int]) -> ProjectComparison
```

**Dependencies:**
- PostgreSQL (all tables)
- Redis (metrics caching)

### 8. WebSocket Service

**Responsibilities:**
- Manage WebSocket connections
- Broadcast real-time updates
- Support project-specific subscriptions
- Handle connection lifecycle

**Key Interfaces:**

```python
class WebSocketService:
    def connect(client_id: str, user_id: str) -> None
    def disconnect(client_id: str) -> None
    def subscribe(client_id: str, project_id: int) -> None
    def broadcast_scan_progress(project_id: int, progress: ScanProgress) -> None
    def broadcast_test_result(project_id: int, result: TestResult) -> None
    def broadcast_run_status(project_id: int, status: RunStatus) -> None
```

**Dependencies:**
- WebSocket library (FastAPI WebSocket)
- Redis (pub/sub for multi-instance support)

## Data Models

### User Model

```python
class User:
    id: str  # UUID
    email: str  # unique, indexed
    password_hash: str
    first_name: str
    last_name: str
    avatar_url: Optional[str]
    role: str  # "user", "admin"
    created_at: datetime
    updated_at: datetime
```

### Project Model

```python
class Project:
    id: int  # auto-increment
    owner_id: str  # foreign key to User
    name: str
    description: Optional[str]
    icon: str  # emoji
    status: str  # "Active", "Scanning", "Failed", "Error"
    status_color: str  # "green", "orange", "red", "gray"
    git_url: Optional[str]
    git_branch: str  # default "main"
    git_credentials_encrypted: Optional[str]
    local_path: Optional[str]
    api_base_url: Optional[str]
    webhook_enabled: bool
    webhook_secret: Optional[str]
    created_at: datetime
    updated_at: datetime
```

### Endpoint Model

```python
class Endpoint:
    id: int  # auto-increment
    project_id: int  # foreign key to Project
    method: str  # "GET", "POST", "PUT", "DELETE", "PATCH"
    path: str  # "/api/users/{id}"
    parameters: JSON  # list of parameter definitions
    request_body_schema: Optional[JSON]
    response_schemas: JSON  # map of status code to schema
    status: str  # "Scanned", "Unscanned", "Error", "Warning"
    status_color: str
    last_scanned: Optional[datetime]
    created_at: datetime
```

### TestCase Model

```python
class TestCase:
    id: str  # "TC-XXXXX"
    endpoint_id: int  # foreign key to Endpoint
    description: str
    status: str  # "Approved", "Draft", "Pending Review", "Blocked"
    priority: str  # "High", "Medium", "Low"
    test_type: str  # "Functional", "Security", "Performance", "UI/UX"
    code_snippet: str  # executable test code
    input_data: JSON  # test input
    expected_output: JSON  # expected response
    assertions: List[str]  # list of assertion descriptions
    created_by: str  # "AI" or user_id
    last_modified: datetime
    created_at: datetime
```

### TestRun Model

```python
class TestRun:
    id: str  # "run_XXXXX"
    project_id: int  # foreign key to Project
    status: str  # "Running", "Success", "Failed", "Partial", "Cancelled"
    status_color: str
    started_at: datetime
    completed_at: Optional[datetime]
    duration: Optional[str]  # "1m 45s"
    pass_rate: float
    pass_count: int
    fail_count: int
    skip_count: int
    healed_count: int
    triggered_by: str  # user_id or "System Automation"
    self_healing_summary: str
```

### TestResult Model

```python
class TestResult:
    id: int  # auto-increment
    test_run_id: str  # foreign key to TestRun
    test_case_id: str  # foreign key to TestCase
    status: str  # "Passed", "Failed", "Skipped", "Healed"
    execution_time: float  # seconds
    error_message: Optional[str]
    stack_trace: Optional[str]
    actual_output: Optional[JSON]
    healed: bool
    healing_action: Optional[str]
    created_at: datetime
```

### HealingLog Model

```python
class HealingLog:
    id: int  # auto-increment
    test_case_id: str  # foreign key to TestCase
    test_result_id: int  # foreign key to TestResult
    change_type: str  # "path_change", "schema_change", "auth_change"
    old_value: str
    new_value: str
    reason: str
    success: bool
    created_at: datetime
```

### APIKey Model

```python
class APIKey:
    id: int  # auto-increment
    user_id: str  # foreign key to User
    name: str
    key_hash: str  # hashed API key
    prefix: str  # "ak_XXXX" for display
    last_used: Optional[datetime]
    created_at: datetime
    revoked_at: Optional[datetime]
```

### ScanJob Model

```python
class ScanJob:
    id: str  # UUID
    project_id: int  # foreign key to Project
    status: str  # "Pending", "Running", "Completed", "Failed"
    progress: int  # 0-100
    endpoints_found: int
    error_message: Optional[str]
    started_at: datetime
    completed_at: Optional[datetime]
```

### GenerationJob Model

```python
class GenerationJob:
    id: str  # UUID
    project_id: int  # foreign key to Project
    endpoint_ids: List[int]
    config: JSON  # generation configuration
    status: str  # "Pending", "Running", "Completed", "Failed"
    progress: int  # 0-100
    tests_generated: int
    error_message: Optional[str]
    started_at: datetime
    completed_at: Optional[datetime]
```

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Project with ID 123 not found",
    "details": {
      "project_id": 123
    },
    "timestamp": "2025-12-29T12:00:00Z"
  }
}
```

### Error Codes

- **AUTH_001**: Invalid credentials
- **AUTH_002**: Token expired
- **AUTH_003**: Insufficient permissions
- **PROJ_001**: Project not found
- **PROJ_002**: Project name already exists
- **SCAN_001**: Repository access denied
- **SCAN_002**: Unsupported framework
- **GEN_001**: LLM API error
- **GEN_002**: Invalid endpoint for generation
- **EXEC_001**: Test execution timeout
- **EXEC_002**: Target API unreachable
- **VAL_001**: Invalid input data
- **SYS_001**: Database connection error
- **SYS_002**: Internal server error

### Error Handling Strategy

1. **Validation Errors**: Return 400 Bad Request with specific field errors
2. **Authentication Errors**: Return 401 Unauthorized with error code
3. **Authorization Errors**: Return 403 Forbidden with error code
4. **Not Found Errors**: Return 404 Not Found with resource details
5. **Conflict Errors**: Return 409 Conflict with conflict details
6. **Rate Limit Errors**: Return 429 Too Many Requests with retry-after header
7. **Server Errors**: Return 500 Internal Server Error with error ID for tracking

### Retry Logic

- **LLM API calls**: Retry up to 3 times with exponential backoff
- **Database operations**: Retry transient errors up to 2 times
- **Git operations**: Retry network errors up to 2 times
- **Test execution**: No automatic retry (user-initiated)

## Testing Strategy

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage and correctness.

### Unit Testing

Unit tests focus on:
- **API endpoint validation**: Test each endpoint with valid and invalid inputs
- **Service method behavior**: Test business logic with specific scenarios
- **Database operations**: Test CRUD operations and transactions
- **Authentication flows**: Test login, registration, token validation
- **Error handling**: Test error responses and edge cases

### Property-Based Testing

Property-based tests validate universal properties across all inputs using a PBT library (Hypothesis for Python). Each test runs a minimum of 100 iterations with randomized inputs.

### Test Configuration

- **Framework**: pytest for unit tests, Hypothesis for property-based tests
- **Coverage target**: 80% code coverage minimum
- **Test isolation**: Each test uses a fresh database transaction that rolls back
- **Mocking**: Mock external services (LLMs, Git, email) in unit tests
- **Integration tests**: Test full request/response cycles with test database

### Continuous Integration

- Run all tests on every pull request
- Block merges if tests fail or coverage drops below threshold
- Run property-based tests with extended iterations (1000+) nightly


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several areas where properties can be consolidated to avoid redundancy:

- **Authentication properties (1.1-1.5)** can be consolidated into fewer properties focusing on token lifecycle and credential validation
- **CRUD properties (2.1-2.5, 5.1-5.7)** share common patterns that can be generalized
- **Test generation properties (4.2-4.5)** all verify that specific test categories are generated, which can be combined
- **Coverage calculation properties (8.1-8.5)** all verify different aspects of coverage calculation that can be unified
- **Logging properties (14.1-14.3)** can be consolidated into a single comprehensive logging property

### Authentication and Authorization Properties

**Property 1: User registration creates valid accounts**
*For any* valid registration data (email, password, first_name, last_name), creating a user account should result in a persisted user with hashed password, unique ID, and correct timestamps.
**Validates: Requirements 1.1**

**Property 2: Token lifecycle correctness**
*For any* valid user credentials, logging in should return a JWT token that authorizes requests until expiration at 24 hours, after which it should be rejected with 401 Unauthorized.
**Validates: Requirements 1.2, 1.4, 1.5**

**Property 3: Password reset generates secure tokens**
*For any* registered user email, requesting password reset should generate a unique, time-limited reset token and send it via email.
**Validates: Requirements 1.3**

### Project Management Properties

**Property 4: Project CRUD operations maintain consistency**
*For any* valid project data, creating a project should persist it with a unique ID, retrieving it should return the same data, updating it should persist changes, and deleting it should cascade delete all associated endpoints, test cases, and test runs.
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 13.6**

**Property 5: Project status transitions are valid**
*For any* project, the status should only be one of "Active", "Scanning", "Failed", or "Error", and status transitions should follow valid state machine rules.
**Validates: Requirements 2.6**

### API Scanning Properties

**Property 6: Repository scanning discovers all endpoints**
*For any* valid repository URL with REST API code, scanning should discover all endpoint definitions and extract their HTTP method, path, parameters, and response schemas.
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

**Property 7: Scan error handling preserves system state**
*For any* scan that encounters errors, the system should log the error, mark affected endpoints with status "Error", and leave successfully scanned endpoints unchanged.
**Validates: Requirements 3.5**

**Property 8: OpenAPI spec parsing is complete**
*For any* valid OpenAPI/Swagger specification, parsing should extract all endpoint definitions with complete metadata matching the specification.
**Validates: Requirements 3.6**

### Test Generation Properties

**Property 9: Test generation creates comprehensive test suites**
*For any* endpoint, AI-powered test generation should create test cases covering all three categories (functional, security, performance) with appropriate subcategories: functional tests for valid/invalid/edge cases, security tests for SQL injection/XSS/auth bypass/authorization, and performance tests for response time/load/rate limiting.
**Validates: Requirements 4.2, 4.3, 4.4, 4.5**

**Property 10: Generated tests have correct initial state**
*For any* completed test generation job, all generated test cases should have status "Draft", a priority assigned based on risk assessment, and a unique ID in format "TC-XXXXX".
**Validates: Requirements 4.6, 5.6**

**Property 11: Test generation jobs are asynchronous**
*For any* test generation request, the system should immediately return a job ID and queue the generation for asynchronous processing.
**Validates: Requirements 4.1**

**Property 12: User instructions influence generation**
*For any* test generation request with additional instructions, the generated tests should reflect those instructions in their test logic or assertions.
**Validates: Requirements 4.8**

### Test Case Management Properties

**Property 13: Test case filtering is accurate**
*For any* project and filter criteria (status, priority, type), the returned test cases should exactly match the filter conditions.
**Validates: Requirements 5.1, 5.2**

**Property 14: Test case state transitions are valid**
*For any* test case, approving it should update status to "Approved", editing it should update last_modified timestamp, and deleting it should remove it from the database.
**Validates: Requirements 5.3, 5.4, 5.5**

**Property 15: Bulk operations affect all selected items**
*For any* set of test case IDs, bulk approve or delete operations should affect exactly those test cases and no others.
**Validates: Requirements 5.7**

### Test Execution Properties

**Property 16: Test run lifecycle is correct**
*For any* test run with selected test cases, the run should start with status "Running", execute each test case against its endpoint, record results with appropriate status (Passed/Failed/Healed), calculate metrics (pass rate, fail count, duration), and end with final status (Success/Failed/Partial) based on results.
**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**

**Property 17: Test run IDs are unique and formatted correctly**
*For any* test run creation, the assigned ID should match format "run_XXXXX" and be unique across all test runs.
**Validates: Requirements 6.8**

**Property 18: Parallel execution reduces duration**
*For any* test run with multiple test cases, enabling parallel execution should result in shorter total duration than sequential execution.
**Validates: Requirements 6.7**

### Self-Healing Properties

**Property 19: Self-healing adapts to API changes**
*For any* test failure caused by API structure changes (path change or schema change), the self-healing component should detect the change, update the test case with new values, and log the healing action with old and new values.
**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

**Property 20: Unhealable tests are marked for review**
*For any* test failure that cannot be automatically healed, the system should mark the test case for manual review.
**Validates: Requirements 7.5**

**Property 21: Healing metrics are accurate**
*For any* project, the healing success rate should equal (healed tests / total healing attempts), and test runs should report healed count separately from passed count.
**Validates: Requirements 7.6, 7.7**

### Coverage Analysis Properties

**Property 22: Coverage calculation is comprehensive**
*For any* project, the coverage report should calculate the percentage of endpoints with approved tests, identify all untested endpoints, and break down coverage by HTTP method and test type.
**Validates: Requirements 8.1, 8.2, 8.4, 8.5**

**Property 23: Test run coverage is accurate**
*For any* test run, the coverage report should correctly identify which endpoints were tested and which were skipped.
**Validates: Requirements 8.3**

**Property 24: Low coverage triggers warnings**
*For any* project where coverage falls below the configured threshold, the system should flag the project with warning status.
**Validates: Requirements 8.6**

### Analytics Properties

**Property 25: Dashboard aggregation is correct**
*For any* user, dashboard statistics should aggregate metrics across all their projects, including total projects, average coverage, total tests executed, and RL efficiency.
**Validates: Requirements 9.1, 9.2**

**Property 26: Trend analysis provides historical data**
*For any* project and time range, trend analysis should return historical data points for pass rate, coverage, healing rate, and test execution duration.
**Validates: Requirements 9.3, 9.4**

**Property 27: Project comparison is accurate**
*For any* set of projects, comparison metrics should show relative performance across all standard metrics.
**Validates: Requirements 9.5**

**Property 28: RL optimization tracking is complete**
*For any* RL-optimized test execution, the system should track optimization gains, efficiency improvements, and generate insights for anomalous trends.
**Validates: Requirements 9.6, 9.7**

### API Key Management Properties

**Property 29: API key lifecycle is secure**
*For any* API key creation, the system should generate a unique key with prefix "ak_", return it once, store only the hash, track usage timestamps, and immediately invalidate it upon revocation.
**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**

### Real-Time Updates Properties

**Property 30: WebSocket events are broadcast correctly**
*For any* long-running operation (test run, scan), the system should broadcast progress updates via WebSocket to subscribed clients, and clean up connections on disconnect.
**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

### Git Integration Properties

**Property 31: Git integration validates and responds to changes**
*For any* Git configuration, the system should validate repository access, register webhooks when enabled, and trigger rescans on push events using the specified branch.
**Validates: Requirements 12.1, 12.2, 12.3, 12.5**

**Property 32: Git credentials are encrypted**
*For any* stored Git credentials, they should be encrypted before persistence and decrypted only when needed for Git operations.
**Validates: Requirements 12.6**

### Data Integrity Properties

**Property 33: Database transactions are atomic**
*For any* database operation that fails, the system should roll back the entire transaction, leaving the database in its previous consistent state.
**Validates: Requirements 13.2**

**Property 34: Foreign key constraints are enforced**
*For any* database operation that would violate referential integrity, the system should reject the operation with an appropriate error.
**Validates: Requirements 13.3**

### Error Handling and Logging Properties

**Property 35: Comprehensive error logging**
*For any* error that occurs, the system should log it with timestamp, user context, stack trace, and return a user-friendly error message to the client, and send alerts for critical errors.
**Validates: Requirements 14.1, 14.2, 14.6**

**Property 36: Request logging is complete**
*For any* API request, the system should log the method, path, status code, and duration.
**Validates: Requirements 14.3**

### Performance Properties

**Property 37: Concurrency limits prevent resource exhaustion**
*For any* test execution workload, the system should enforce concurrency limits to prevent resource exhaustion.
**Validates: Requirements 15.3**

**Property 38: Performance warnings for slow requests**
*For any* API request with response time exceeding 2 seconds, the system should log a performance warning.
**Validates: Requirements 15.5**

**Property 39: Rate limiting prevents abuse**
*For any* client making excessive requests, the system should enforce rate limits and return 429 Too Many Requests.
**Validates: Requirements 15.6**
