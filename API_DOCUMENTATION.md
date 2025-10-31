# TaskMaster API Documentation

## Overview
TaskMaster is a project and task management API built with Node.js and Express.js. It provides endpoints for user authentication, project management, and task management with role-based access control.

**Base URL:** `http://localhost:3000`

**Version:** 1.0.0

## Authentication
All API endpoints except authentication routes require a valid JWT token. The token is sent as an HTTP-only cookie named 'token'.

### User Roles
- **Role 1**: Admin - Full access to all operations
- **Role 2**: User - Limited permissions, cannot create tasks
- **Role 3**: Moderator - Can manage tasks and projects

---

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Project Endpoints](#project-endpoints)
3. [Task Endpoints](#task-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)

---

## Authentication Endpoints

### 1. User Registration
**Endpoint:** `POST /api/auth/signup`

**Description:** Register a new user account

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmpassword": "SecurePass123!",
  "role": "1"
}
```

**Validation Rules:**
- Email must be valid format
- Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, 1 symbol
- Password and confirmpassword must match
- Name must be at least 3 characters
- Role must be "1", "2", or "3"
- Email must be unique

**Success Response (201):**
```json
{
  "success": true,
  "msg": "Sign up successfully",
  "UserInfo": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "1",
    "createdAt": "2025-10-31T10:00:00.000Z",
    "updatedAt": "2025-10-31T10:00:00.000Z"
  }
}
```

### 2. User Login
**Endpoint:** `POST /api/auth/signin`

**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "1"
  }
}
```

### 3. User Logout
**Endpoint:** `POST /api/auth/logout`

**Description:** Clear authentication token

**Success Response (200):**
```
Logout Successful!!
```

---

## Project Endpoints
*All project endpoints require authentication*

### 1. Create Project
**Endpoint:** `POST /project/add`

**Description:** Create a new project

**Request Body:**
```json
{
  "projectName": "Website Redesign",
  "des": "Complete redesign of company website"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "msg": "Project created successfully",
  "projectInfo": {
    "_id": "project_id",
    "projectName": "Website Redesign",
    "des": "Complete redesign of company website",
    "createdBy": "user_id",
    "createdAt": "2025-10-31T10:00:00.000Z",
    "updatedAt": "2025-10-31T10:00:00.000Z"
  }
}
```

### 2. Update Project
**Endpoint:** `PATCH /project/edit/{id}`

**Description:** Update an existing project (only by creator)

**Path Parameters:**
- `id` (string): Project ID (24-character MongoDB ObjectId)

**Request Body:**
```json
{
  "projectName": "Updated Project Name",
  "des": "Updated description"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "msg": "Project updated successfully",
  "updatedProject": {
    "_id": "project_id",
    "projectName": "Updated Project Name",
    "des": "Updated description",
    "createdBy": "user_id",
    "createdAt": "2025-10-31T10:00:00.000Z",
    "updatedAt": "2025-10-31T11:00:00.000Z"
  }
}
```

### 3. Get Project Info
**Endpoint:** `GET /project/info/{id}`

**Description:** Get detailed information about a specific project

**Path Parameters:**
- `id` (string): Project ID (24-character MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "msg": "Project Info",
  "projectInfo": [
    {
      "_id": "project_id",
      "projectName": "Website Redesign",
      "des": "Complete redesign of company website",
      "createdAt": "2025-10-31T10:00:00.000Z"
    }
  ]
}
```

### 4. List User's Projects
**Endpoint:** `GET /project/listbyuser`

**Description:** Get all projects created by the authenticated user

**Success Response (200):**
```json
{
  "success": true,
  "msg": "Project list",
  "list": [
    {
      "_id": "project_id",
      "projectName": "Website Redesign",
      "des": "Complete redesign of company website",
      "createdAt": "2025-10-31T10:00:00.000Z"
    }
  ]
}
```

### 5. List All Projects
**Endpoint:** `GET /project/list`

**Description:** Get all projects with creator information

**Success Response (200):**
```json
{
  "success": true,
  "msg": "Project list",
  "list": [
    {
      "_id": "project_id",
      "projectName": "Website Redesign",
      "des": "Complete redesign of company website",
      "createdBy": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2025-10-31T10:00:00.000Z"
    }
  ]
}
```

### 6. Delete Project
**Endpoint:** `DELETE /project/delete/{id}`

**Description:** Delete a project (only by creator)

**Path Parameters:**
- `id` (string): Project ID (24-character MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "msg": "Project deleted successfully"
}
```

---

## Task Endpoints
*All task endpoints require authentication*

### 1. Create Task
**Endpoint:** `POST /task/add`

**Description:** Create a new task (Admin and Moderators only, cannot assign to self)

**Request Body:**
```json
{
  "projectId": "project_id",
  "taskName": "Design Homepage",
  "des": "Create mockups and wireframes for the new homepage",
  "createdFor": "user_id"
}
```

**Validation Rules:**
- All fields are required
- Task name must be at least 3 characters
- Description must be at least 10 characters
- Cannot assign task to yourself
- Users with role "2" cannot create tasks
- Project and assigned user must exist

**Success Response (200):**
```json
{
  "success": true,
  "msg": "Task created successfully",
  "taskInfo": {
    "_id": "task_id",
    "projectId": "project_id",
    "taskName": "Design Homepage",
    "des": "Create mockups and wireframes for the new homepage",
    "taskStatus": "pending",
    "createdBy": "creator_id",
    "createdFor": "user_id",
    "createdAt": "2025-10-31T10:00:00.000Z",
    "updatedAt": "2025-10-31T10:00:00.000Z"
  }
}
```

### 2. Get All Tasks for Project
**Endpoint:** `GET /task/all/{projectId}`

**Description:** Get all tasks for a specific project

**Path Parameters:**
- `projectId` (string): Project ID (24-character MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "tasks": [
    {
      "_id": "task_id",
      "projectId": "project_id",
      "taskName": "Design Homepage",
      "des": "Create mockups and wireframes for the new homepage",
      "taskStatus": "pending",
      "createdBy": {
        "name": "Manager Name",
        "email": "manager@example.com"
      },
      "createdFor": {
        "name": "Developer Name",
        "email": "developer@example.com"
      },
      "createdAt": "2025-10-31T10:00:00.000Z",
      "updatedAt": "2025-10-31T10:00:00.000Z"
    }
  ]
}
```

### 3. Get User's Assigned Tasks
**Endpoint:** `GET /task/allbyuser`

**Description:** Get all tasks assigned to the authenticated user

**Success Response (200):**
```json
{
  "success": true,
  "tasks": [
    {
      "_id": "task_id",
      "taskName": "Design Homepage",
      "des": "Create mockups and wireframes for the new homepage",
      "taskStatus": "in-progress",
      "createdBy": {
        "name": "Manager Name",
        "email": "manager@example.com"
      },
      "createdFor": {
        "name": "Developer Name",
        "email": "developer@example.com"
      },
      "projectId": {
        "projectName": "Website Redesign",
        "des": "Complete redesign of company website"
      },
      "createdAt": "2025-10-31T10:00:00.000Z",
      "updatedAt": "2025-10-31T10:00:00.000Z"
    }
  ]
}
```

### 4. Get Task Details
**Endpoint:** `GET /task/{taskId}`

**Description:** Get detailed information about a specific task

**Path Parameters:**
- `taskId` (string): Task ID (24-character MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "taskInfo": {
    "_id": "task_id",
    "projectId": "project_id",
    "taskName": "Design Homepage",
    "des": "Create mockups and wireframes for the new homepage",
    "taskStatus": "in-progress",
    "createdBy": {
      "name": "Manager Name",
      "email": "manager@example.com"
    },
    "createdFor": {
      "name": "Developer Name",
      "email": "developer@example.com"
    },
    "remarks": "Working on wireframes",
    "createdAt": "2025-10-31T10:00:00.000Z",
    "updatedAt": "2025-10-31T11:00:00.000Z"
  }
}
```

### 5. Update Task Status
**Endpoint:** `PATCH /task/statusUpdate/{taskId}`

**Description:** Update task status and remarks (only by assigned user)

**Path Parameters:**
- `taskId` (string): Task ID (24-character MongoDB ObjectId)

**Request Body:**
```json
{
  "taskStatus": "in-progress",
  "remarks": "Started working on wireframes"
}
```

**Allowed Fields:**
- `taskStatus`: "pending", "in-progress", "completed"
- `remarks`: Any string

**Success Response (200):**
```json
{
  "success": true,
  "msg": "Task status updated successfully",
  "updatedTask": {
    "taskName": "Design Homepage",
    "taskStatus": "in-progress",
    "remarks": "Started working on wireframes",
    "updatedAt": "2025-10-31T11:00:00.000Z"
  }
}
```

### 6. Update Task (Full Update)
**Endpoint:** `PUT /task/{taskId}`

**Description:** Full update of task details (only by creator, excludes role "2")

**Path Parameters:**
- `taskId` (string): Task ID (24-character MongoDB ObjectId)

**Request Body:**
```json
{
  "projectId": "project_id",
  "taskName": "Updated Task Name",
  "des": "Updated task description",
  "createdFor": "user_id",
  "taskStatus": "in-progress",
  "remarks": "Updated remarks"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "msg": "Task updated successfully",
  "updatedTask": {
    "taskName": "Updated Task Name",
    "taskStatus": "in-progress",
    "remarks": "Updated remarks",
    "updatedAt": "2025-10-31T11:00:00.000Z"
  }
}
```

### 7. Delete Task
**Endpoint:** `DELETE /task/{taskId}`

**Description:** Delete a task (by creator or users with role "2")

**Path Parameters:**
- `taskId` (string): Task ID (24-character MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "msg": "Task deleted successfully"
}
```

---

## Data Models

### User Model
```json
{
  "_id": "ObjectId",
  "name": "string (required, min 3 chars)",
  "email": "string (required, unique, valid email)",
  "password": "string (required, hashed)",
  "role": "string (required, enum: ['1', '2', '3'])",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Project Model
```json
{
  "_id": "ObjectId",
  "projectName": "string (required, unique)",
  "des": "string (required, description)",
  "createdBy": "ObjectId (ref: User, required)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Task Model
```json
{
  "_id": "ObjectId",
  "projectId": "ObjectId (ref: Project, required)",
  "taskName": "string (required, unique)",
  "des": "string (required, description)",
  "taskStatus": "string (enum: ['pending', 'in-progress', 'completed'], default: 'pending')",
  "createdBy": "ObjectId (ref: User, required)",
  "createdFor": "ObjectId (ref: User, required)",
  "remarks": "string (optional)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Error Handling

### Common Error Responses

#### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation error message"
}
```

#### Authentication Error (401)
```json
{
  "error": "Invalid credentials"
}
```

#### Authorization Error (403)
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

#### Not Found Error (404)
```json
{
  "success": false,
  "error": "Resource not found"
}
```

#### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error"
}
```

### Common Error Scenarios

1. **Invalid ObjectId Format**: When providing invalid 24-character MongoDB ObjectId
2. **Missing Authentication**: When accessing protected routes without valid token
3. **Insufficient Permissions**: When users try to perform actions beyond their role
4. **Resource Not Found**: When referencing non-existent projects, tasks, or users
5. **Validation Failures**: When request data doesn't meet validation criteria
6. **Duplicate Data**: When creating resources with unique constraints (email, project name, task name)

---

## Rate Limiting & Security

- All passwords are hashed using bcrypt
- JWT tokens expire after 1 hour
- Cookies are set as HTTP-only and secure
- Input validation is performed on all endpoints
- Role-based access control is implemented

---

## Development Notes

- Base URL: `http://localhost:3000`
- Database: MongoDB with Mongoose ODM
- Authentication: JWT with HTTP-only cookies
- CORS enabled for cross-origin requests
- Morgan logging for request monitoring