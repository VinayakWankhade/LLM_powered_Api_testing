# API Documentation

## Overview

This is the documentation for the Sample API, which provides user management functionality.

## Authentication

The API uses standard HTTP authentication. Include your API key in the Authorization header:

```
Authorization: Bearer your-api-key-here
```

## Base URL

```
http://localhost:8000
```

## Endpoints

### Users

#### Get All Users

Retrieve a paginated list of all users in the system.

**Endpoint:** `GET /users`

**Parameters:**
- `limit` (optional): Maximum number of users to return (1-100, default: 10)
- `offset` (optional): Number of users to skip (default: 0)

**Example Request:**
```bash
curl -X GET "http://localhost:8000/users?limit=20&offset=0" \
  -H "Authorization: Bearer your-api-key"
```

**Example Response:**
```json
{
  "users": [
    {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

#### Create User

Create a new user in the system.

**Endpoint:** `POST /users`

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "User Name"
}
```

**Example Response:**
```json
{
  "id": 123,
  "email": "user@example.com",
  "name": "User Name",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### Get User by ID

Retrieve a specific user by their ID.

**Endpoint:** `GET /users/{userId}`

**Parameters:**
- `userId` (path): The ID of the user to retrieve

**Example Request:**
```bash
curl -X GET "http://localhost:8000/users/123" \
  -H "Authorization: Bearer your-api-key"
```

#### Update User

Update an existing user's information.

**Endpoint:** `PUT /users/{userId}`

**Parameters:**
- `userId` (path): The ID of the user to update

**Request Body:**
```json
{
  "email": "updated@example.com",
  "name": "Updated Name"
}
```

#### Delete User

Delete a user from the system.

**Endpoint:** `DELETE /users/{userId}`

**Parameters:**
- `userId` (path): The ID of the user to delete

**Response:** 204 No Content on success

### System

#### Health Check

Check the health status of the API.

**Endpoint:** `GET /health`

**Example Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

Error responses include a message:

```json
{
  "error": "User not found",
  "code": 404
}
```

## Rate Limiting

The API implements rate limiting:
- 100 requests per minute per API key
- 1000 requests per hour per API key

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when the rate limit resets

## Best Practices

1. **Use appropriate HTTP methods**: GET for retrieval, POST for creation, PUT for updates, DELETE for removal
2. **Handle errors gracefully**: Always check status codes and handle error responses
3. **Implement pagination**: Use limit and offset parameters for large datasets
4. **Cache responses**: Cache GET responses when appropriate to reduce API calls
5. **Use HTTPS**: Always use HTTPS in production environments

## SDKs and Libraries

Official SDKs are available for:
- Python: `pip install sample-api-client`
- JavaScript: `npm install sample-api-client`
- Java: Available on Maven Central

## Support

For API support, contact:
- Email: support@example.com
- Documentation: https://docs.example.com
- Status Page: https://status.example.com