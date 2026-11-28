# Employee Leave Management System

## Project Overview

LeaveTrack is a full-stack web application developed as a Master of Science in Computer Science capstone project at City University of Seattle.

The system simplifies employee leave applications, manager approvals, leave balance tracking, and organizational leave record management.

## Project Objectives

- Automate employee leave management.
- Reduce manual administrative work.
- Improve leave tracking and transparency.
- Provide role-specific dashboards.
- Maintain centralized leave records.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Authentication | JWT, bcrypt |
| API | REST API |
| Development | VS Code, GitHub Codespaces |
| Version Control | Git and GitHub |

## System Features

### Employee Portal

- Employee login and logout
- Submit leave requests
- Track request status
- View annual leave balance
- Search and filter requests
- View employee profile

### Manager Portal

- View employee leave requests
- Approve or reject requests
- Monitor leave statistics
- Search and filter records

### Admin Portal

- Read-only leave record monitoring
- View organizational leave statistics
- Search and filter records

## System Architecture

React Frontend
       |
       v
Node.js / Express REST API
       |
       v
MySQL Database

## Leave Management Workflow

1. Employee logs into the system.
2. Employee submits a leave request.
3. Request is stored in MySQL as Pending.
4. Manager reviews the request.
5. Manager approves or rejects the request.
6. Employee views the updated status.
7. Approved annual leave is reflected in the displayed balance.

## Project Structure

- frontend/
  - src/
  - App.jsx
  - App.css
  - Login.jsx
  - Login.css
- backend/
  - config/db.js
  - server.js
  - seedUsers.js
- README.md
- .gitignore

## Running the Application

Configure the MySQL database and backend environment variables before starting.

### Backend

    cd backend
    npm install
    node server.js

### Frontend

    cd frontend
    npm install
    npm run dev

## Evaluation Criteria

- Functional correctness
- Role-based access control
- Leave balance accuracy
- Workflow correctness
- API response time

## Security and Limitations

The prototype includes password hashing, JWT login,
and role-specific user interfaces.

Server-side authorization and leave balance enforcement
require further implementation and verification before
production deployment.

The system uses synthetic demonstration data.

## Future Enhancements

- Complete backend authorization
- Email notifications
- Employee account management
- Department management
- Advanced reporting
- Cloud deployment

## Academic Information
- Zeinep Zhorobekova
- University: City University of Seattle
- Program: MS in Computer Science
- Course: CS 687 – Capstone
- Project: Employee Leave Management System