# Teacher Session Booking API

A RESTful backend application built using Node.js, TypeScript, Express.js, MongoDB, and Mongoose. The application allows users to book available teacher sessions, mark booked sessions as completed, and view their session history.

## Technology Stack

- Node.js
- TypeScript
- Express.js
- MongoDB
- Mongoose
- dotenv

## Features

- Create users with unique email addresses.
- Create teacher sessions with date and time validation.
- Retrieve available sessions for a specific date.
- Book available sessions for registered users.
- Prevent duplicate session bookings.
- Mark booked sessions as completed.
- Retrieve user sessions separated into upcoming and completed sessions.
- Centralized error handling.
- MongoDB aggregation pipelines for session retrieval.

## Project Structure

```text
teacher-session-booking/
│
├── src/
│   ├── config/
│   │   └── database.ts
│   │
│   ├── controllers/
│   │   ├── user.controller.ts
│   │   └── session.controller.ts
│   │
│   ├── middleware/
│   │   └── error.middleware.ts
│   │
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── teacher.model.ts
│   │   └── session.model.ts
│   │
│   ├── routes/
│   │   ├── user.routes.ts
│   │   └── session.routes.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd teacher-session-booking
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/teacher_session_booking
```

Make sure MongoDB is running before starting the application.

### 4. Start the development server

```bash
npm run dev
```

Server URL:

```text
http://localhost:5000
```

### 5. Build the project

```bash
npm run build
```

### 6. Start the production server

```bash
npm start
```

## API Documentation

### 1. Create User

**POST** `/users`

Creates a new user. Email must be unique.

Request body:

```json
{
  "fullName": "Rahul Kumar",
  "email": "rahul@example.com",
  "phone": "9876543210"
}
```

### 2. Create Session

**POST** `/sessions`

Creates an available session for an existing teacher.

Request body:

```json
{
  "teacherId": "TEACHER_OBJECT_ID",
  "startTime": "2026-11-25T10:00:00.000Z",
  "endTime": "2026-11-25T11:00:00.000Z"
}
```

### 3. Get Available Sessions

**GET** `/sessions/available?dateTimestamp={timestamp}`

Returns available sessions for the supplied date using a MongoDB aggregation pipeline.

### 4. Book Session

**POST** `/sessions/:id/book`

Books an available session for an existing user.

Request body:

```json
{
  "userId": "USER_OBJECT_ID"
}
```

### 5. Complete Session

**PATCH** `/sessions/:id/complete`

Marks a booked session as completed and sets `completedAt`.

### 6. Get User Sessions

**GET** `/users/:id/sessions`

Returns the user's sessions in two categories:

- Upcoming Sessions
- Completed Sessions

Uses a MongoDB aggregation pipeline.

## Session Status

| Status | Description |
|---|---|
| AVAILABLE | Session is available for booking |
| BOOKED | Session has been booked by a user |
| COMPLETED | Session has been completed |

## Error Handling

The application uses centralized Express error-handling middleware to handle database errors, validation errors, duplicate values, and unexpected server errors.

## API Testing

All APIs can be tested using Postman. The Postman collection is included in the project repository.


## License

This project was developed as part of a Backend Developer Assignment.
