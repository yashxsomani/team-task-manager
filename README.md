# Team Task Manager

A full-stack task management application for teams with authentication, role-based access control, projects, tasks, and a Kanban board.

## Live Demo

- Live URL: `https://your-app.railway.app`
- GitHub Repo: `https://github.com/<your-username>/team-task-manager`

## Features

- User authentication with JWT
- Role-based access control (Admin / Member)
- Project creation, update, delete, and membership management
- Task creation, assignment, status updates, and deletion
- Kanban-style task board for task tracking
- Dashboard with task summaries, overdue tasks, and recent projects

## Tech Stack

| Frontend | Backend | Database | Deployment |
| --- | --- | --- | --- |
| React 18 | Node.js + Express | PostgreSQL | Railway |
| Vite | Prisma ORM |  |  |
| React Router v6 | Axios |  |  |

## Local Setup

### Prerequisites

- Node.js 18+ / npm
- PostgreSQL
- Git

### Clone and install

```bash
git clone https://github.com/<your-username>/team-task-manager.git
cd team-task-manager
npm run install:all
```

### Environment setup

Create copies of the example environment file and update values:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and set your database connection, JWT secret, and client URL.

### Database migration

```bash
cd server
npx prisma migrate dev --name init
```

### Run development servers

From the repository root:

```bash
npm run dev:server
npm run dev:client
```

Then open:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Environment Variables

| Name | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string for Prisma | `postgresql://user:pass@localhost:5432/team_task_manager` |
| `JWT_SECRET` | Secret key used to sign JWT tokens | `supersecret123` |
| `PORT` | Express server port | `5000` |
| `NODE_ENV` | Node environment mode | `production` |
| `CLIENT_URL` | Frontend base URL for CORS | `http://localhost:3000` |

## API Endpoints

| Method | Path | Auth Required | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | No | Register a new user and return JWT + user data |
| POST | `/api/auth/login` | No | Authenticate user and return JWT + user data |
| GET | `/api/projects` | Yes | List projects where the user is owner or member |
| POST | `/api/projects` | Yes | Create a new project and add the creator as ADMIN |
| GET | `/api/projects/:id` | Yes | Get project details, members, and task count |
| PUT | `/api/projects/:id` | Yes | Update project data (ADMIN only) |
| DELETE | `/api/projects/:id` | Yes | Delete a project (ADMIN only) |
| POST | `/api/projects/:id/members` | Yes | Add a project member with a role (ADMIN only) |
| DELETE | `/api/projects/:id/members/:userId` | Yes | Remove a project member (ADMIN only) |
| GET | `/api/projects/:id/tasks` | Yes | List tasks for a project |
| POST | `/api/projects/:id/tasks` | Yes | Create a new task in a project (ADMIN only) |
| PUT | `/api/projects/:id/tasks/:taskId` | Yes | Update task status or assignee (member allowed) |
| DELETE | `/api/projects/:id/tasks/:taskId` | Yes | Delete a task (ADMIN only) |
| GET | `/api/dashboard` | Yes | Get dashboard metrics, overdue tasks, and recent projects |

## Database Schema Overview

| Table | Key Columns |
| --- | --- |
| `User` | `id`, `name`, `email`, `password`, `createdAt` |
| `Project` | `id`, `name`, `description`, `createdAt`, `ownerId` |
| `ProjectMember` | `id`, `projectId`, `userId`, `role` |
| `Task` | `id`, `title`, `description`, `status`, `dueDate`, `createdAt`, `projectId`, `assigneeId` |

## Deployment (Railway)

1. Create a Railway project.
2. Add the PostgreSQL plugin and copy the generated `DATABASE_URL`.
3. Connect your GitHub repository and deploy the `team-task-manager` repo.
4. Set Railway environment variables: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `NODE_ENV`, `CLIENT_URL`.
5. Configure the deploy command to run:
   ```bash
   cd server && npx prisma migrate deploy
   ```
6. Deploy and verify the live URL.

## Project Structure

```text
team-task-manager/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── App.css
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── components/
│       │   └── TaskBoard.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Login.jsx
│       │   ├── ProjectDetail.jsx
│       │   ├── ProjectList.jsx
│       │   └── Signup.jsx
│       └── utils/
│           └── axios.js
├── server/
│   ├── Procfile
│   ├── package.json
│   ├── src/
│   │   ├── index.js
│   │   ├── lib/
│   │   │   └── prisma.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── rbac.js
│   │   └── routes/
│   │       ├── auth.js
│   │       ├── dashboard.js
│   │       ├── projects.js
│   │       └── tasks.js
│   └── prisma/
│       └── schema.prisma
└── README.md
```

- `npm run dev:server` - Start backend in development mode
- `npm run dev:client` - Start frontend in development mode