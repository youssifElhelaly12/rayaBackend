# Raya Backend API

A Node.js backend API built with Express and MySQL, featuring user authentication and management.

## Features

- User authentication (register/login)
- JWT-based authorization
- Role-based access control
- User CRUD operations
- Error handling
- MySQL database with Sequelize ORM

## Prerequisites

- Node.js (v14 or higher)
- MySQL server
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a MySQL database named `raya_db`
4. Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Users

- GET `/api/users` - Get all users (Admin only)
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user (Admin only)

## Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Handling

The API returns appropriate HTTP status codes and error messages in JSON format:

```json
{
  "message": "Error message",
  "errors": [{ "field": "fieldName", "message": "validation message" }]
}
```