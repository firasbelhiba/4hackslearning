# 4hacks Learning Platform

A complete certification/learning platform built as a monorepo with separate frontend and backend.

## Project Structure

```
/4hacks-learning
  /backend          # NestJS API
  /frontend         # Next.js 14 App
  /shared           # Shared types and constants
```

## Tech Stack

### Backend
- **Framework**: NestJS with TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: Passport.js with JWT
- **Docs**: Swagger/OpenAPI
- **Validation**: class-validator

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Data Fetching**: React Query
- **Forms**: React Hook Form + Zod

## Features

- User authentication (register, login, JWT refresh)
- Course management (CRUD, modules, lessons)
- Quiz system with grading
- Progress tracking with video watch time
- Certificate generation and verification
- Admin dashboard
- Retro brutalism design

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm install --workspaces
```

3. Set up environment variables:

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your database URL and secrets

# Frontend
cp frontend/.env.example frontend/.env
```

4. Set up the database:

```bash
cd backend
npm run db:migrate
npm run db:seed
```

5. Start development servers:

```bash
# From root directory
npm run dev
```

This will start:
- Backend API at http://localhost:3001
- Frontend at http://localhost:3000
- Swagger docs at http://localhost:3001/api/docs

## Test Accounts

After running the seed:

| Role       | Email                    | Password      |
|------------|--------------------------|---------------|
| Admin      | admin@4hacks.com         | Admin123!     |
| Instructor | instructor@4hacks.com    | Instructor123!|
| Student    | student1@example.com     | Student123!   |

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh tokens

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:slug` - Get course details
- `POST /api/courses` - Create course (Instructor/Admin)
- `PATCH /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Enrollments
- `POST /api/enrollments/course/:courseId` - Enroll in course
- `GET /api/enrollments` - Get user enrollments
- `PATCH /api/enrollments/:id/lessons/:lessonId/progress` - Update progress

### Quizzes
- `GET /api/quizzes/:id` - Get quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers

### Certificates
- `GET /api/certificates` - Get user certificates
- `GET /api/certificates/verify/:code` - Verify certificate

## Design System

The platform uses a **Retro Brutalism** design style featuring:

- Bold black borders
- Box shadows (shifted shadows)
- Bright accent colors (lime, pink, purple, yellow)
- Clean typography
- Grid patterns

## License

MIT
