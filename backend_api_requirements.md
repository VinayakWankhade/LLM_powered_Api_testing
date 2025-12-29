# Backend API Implementation Guide

This document lists all the API endpoints required by the frontend application. Use this as a blueprint to build the backend services in the project root.

## 1. Authentication Services
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/register` | Create new user | `{ firstName, lastName, email, password }` | `{ token, user }` |
| POST | `/api/auth/login` | Authenticate user | `{ email, password }` | `{ token, user }` |
| POST | `/api/auth/reset-password` | Request password reset | `{ email }` | `{ message }` |
| GET | `/api/auth/verify` | Verify token/session | Headers: `Authorization: Bearer <token>` | `{ user }` |

---

## 2. Dashboard Services
| Method | Endpoint | Description | Response Model |
|--------|----------|-------------|----------------|
| GET | `/api/dashboard/stats` | KPI card metrics | `{ projects: 12, apiCoverage: 87, testsExecuted: 2400, rlEfficiency: 94 }` |
| GET | `/api/dashboard/recent-activity` | Global activity feed | `Array<{ id, type, message, timestamp, status }>` |
| GET | `/api/system/health` | Component status | `{ database: 'Healthy', aiEngine: 'Healthy', scanner: 'Busy' }` |

---

## 3. Project Management
| Method | Endpoint | Description | Request/Response |
|--------|----------|-------------|------------------|
| GET | `/api/projects` | List all projects | `Array<{ id, name, status, endpoints, coverage, lastRun, trend }>` |
| POST | `/api/projects` | Create new project | Req: `{ name, description, gitUrl, apiBaseUrl }` |
| GET | `/api/projects/:id` | Fetch project details | `{ id, name, stats: { endpoints, tests, passRate }, recentRuns: [] }` |
| PATCH | `/api/projects/:id` | Update settings | Req: `{ name, description, notificationsEnabled: bool }` |
| DELETE | `/api/projects/:id` | Remove project | `{ message: "Project deleted" }` |

---

## 4. API Endpoint Analysis
| Method | Endpoint | Description | Response Model |
|--------|----------|-------------|----------------|
| GET | `/api/projects/:id/endpoints` | List project endpoints | `Array<{ id, method, path, status, lastScanned }>` |
| POST | `/api/projects/:id/endpoints/scan` | Trigger codebase scan | `{ scanId, status: "Started" }` |
| GET | `/api/projects/:id/endpoints/:eid` | Endpoint details | `{ id, path, params: [], responses: [], testCoverage: 85 }` |

---

## 5. Test Case Generation & Execution
| Method | Endpoint | Description | Request/Response |
|--------|----------|-------------|------------------|
| GET | `/api/projects/:id/test-cases` | List test cases | `Array<{ id, description, status, priority, type }>` |
| POST | `/api/projects/:id/tests/generate` | AI Test Generation | Req: `{ endpointIds: [] }` -> Res: `{ jobId }` |
| GET | `/api/projects/:id/tests/:tid` | Test details | `{ id, code, inputData, expectedOutput, assertions }` |
| POST | `/api/projects/:id/runs` | Execute test suite | Req: `{ testCaseIds: [] }` -> Res: `{ runId }` |

---

## 6. Test Reports & Analytics
| Method | Endpoint | Description | Response Model |
|--------|----------|-------------|----------------|
| GET | `/api/projects/:id/runs` | History of test runs | `Array<{ id, status, startedAt, duration, passRate, triggeredBy }>` |
| GET | `/api/projects/:id/runs/:rid` | Single run details | `{ id, results: [], stats: { passed, failed, healed } }` |
| GET | `/api/projects/:id/runs/:rid/coverage` | Coverage report | `{ coveredEndpoints: 85, totalEndpoints: 100, gaps: [] }` |
| GET | `/api/projects/:id/runs/:rid/healing` | Self-healing logs | `Array<{ id, testCaseId, oldSelector, newSelector, reason }>` |

---

## 7. Global Analytics
| Method | Endpoint | Description | Response Model |
|--------|----------|-------------|----------------|
| GET | `/api/analytics/global` | Global average coverage | `{ avgCoverage: 88, totalTests: 15400, totalHealed: 240 }` |
| GET | `/api/analytics/trends` | History of metrics | `Array<{ date, coverage, successRate, healingFreq }>` |
| GET | `/api/analytics/rl-insights` | RL Agent performance | `{ optimizationGains: 15, agentConfidence: 98, pathsOptimized: 1200 }` |

---

## 8. User Account & API Keys
| Method | Endpoint | Description | Request/Response |
|--------|----------|-------------|------------------|
| GET | `/api/user/profile` | Current user info | `{ id, firstName, lastName, email, avatar, role }` |
| PATCH | `/api/user/profile` | Update profile | Req: `{ firstName, lastName, email }` |
| GET | `/api/user/api-keys` | List active keys | `Array<{ id, name, lastUsed, prefix: "ak_..." }>` |
| POST | `/api/user/api-keys` | Generate new key | Req: `{ name }` -> Res: `{ key: "ak_full_key_here..." }` |
| DELETE | `/api/user/api-keys/:id` | Revoke key | `{ message: "Key revoked" }` |

---

## Implementation Notes:

### Database Schema Recommendations:
- **Users**: Auth fields + Profile info
- **Projects**: Metadata + Links to owners
- **Endpoints**: Mapped to Projects (one-to-many)
- **TestCases**: Mapped to Endpoints (many-to-one)
- **TestRuns**: Mapped to Projects (one-to-many)
- **TestResults**: Mapped to TestRuns and TestCases

### AI Engine Integration:
- The `/generate` endpoint should trigger an asynchronous worker (RabbitMQ/Redis Queue).
- The AI should process the Endpoint's path, parameters, and responses to generate valid code.
- Self-healing logic should be triggered when a test fails due to UI/DOM changes but the underlying logic is still reachable.

### Security:
- Implement **JWT Authentication** for all `/api` routes except `/auth`.
- Use **Bcrypt** for password hashing.
- API Keys should be stored as salted hashes.
