# AI-Powered Code Review Platform

An end-to-end platform for connecting GitHub repositories, ingesting pull requests, running AI-assisted reviews, and surfacing actionable feedback through a modern dashboard.

## Features

- JWT authentication with GitHub OAuth2 sign-in
- Repository connection and GitHub webhook registration
- Pull request synchronization from GitHub
- Review automation with GitHub webhooks and direct AI analysis
- AI-powered review, security scan, and quality analysis
- Rich dashboard with review metrics and recent activity
- Monaco-based diff viewer with inline issue markers
- Django admin for operational visibility

## Architecture

```text
+------------------+        +----------------------+        +------------------+
| React Frontend   | <----> | Django REST Backend  | <----> | PostgreSQL       |
| Vite + Tailwind  |        | Auth, APIs, Webhooks |        | Persistent data  |
+------------------+        +----------+-----------+        +------------------+
                                          |
                                          v
                               +----------------------+
                               | FastAPI AI Service   |
                               | Anthropic analysis   |
                               +----------------------+
```

## Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Python 3.11+

## Setup

1. Clone the repository.
2. Copy `.env.example` to `.env` and fill in the required values.
3. Run `docker-compose up --build`.
4. Open `http://localhost:3000`.

## Render + Vercel Deployment

Deployment was prepared for:

- Frontend on Vercel
- Django backend on Render Web Service
- FastAPI AI service on Render Web Service
- PostgreSQL on Render

### 1. Push the repository to GitHub

Render Blueprints and Vercel both deploy from a Git repository, so make sure this project is committed and pushed first.

### 2. Deploy backend services on Render

1. In Render, choose **New > Blueprint**.
2. Connect the GitHub repository that contains this project.
3. Render will detect [render.yaml](c:\Projects\AI-code-Review\ai-code-review\render.yaml).
4. Create the stack and let Render provision:
   - `ai-code-review-backend`
   - `ai-code-review-ai`
   - `ai-code-review-db`
5. After the backend web service is created, copy its public URL. It will look like `https://your-backend-name.onrender.com`.

### 3. Set required Render environment variables

In the Render dashboard, set these exact values on the backend web service:

- `FRONTEND_URL=https://your-vercel-domain.vercel.app`
- `BACKEND_PUBLIC_URL=https://your-backend-name.onrender.com`
- `GITHUB_CLIENT_ID=...`
- `GITHUB_CLIENT_SECRET=...`
- `GITHUB_WEBHOOK_SECRET=...`

Set these exact values on the AI service:

- `ANTHROPIC_API_KEY=...`

### 4. Deploy the frontend on Vercel

1. In Vercel, import the same GitHub repository.
2. Set the project root directory to `frontend`.
3. Vercel will use [frontend/vercel.json](c:\Projects\AI-code-Review\ai-code-review\frontend\vercel.json).
4. Add these environment variables in Vercel:
   - `VITE_API_URL=https://your-backend-name.onrender.com`
   - `VITE_GITHUB_CLIENT_ID=your-github-client-id`
5. Deploy the frontend.

### 5. Update Render after Vercel gives you the frontend URL

Once Vercel creates the real frontend URL, update `FRONTEND_URL` on:

- Render backend service

Then redeploy the backend service so CORS and CSRF settings use the correct origin.

### 6. Configure GitHub OAuth

In GitHub Developer Settings:

- Homepage URL: `https://your-vercel-domain.vercel.app`
- Authorization callback URL: `https://your-vercel-domain.vercel.app/auth/github`

### 7. Verify the deployment

Check these endpoints:

- Frontend: `https://your-vercel-domain.vercel.app`
- Backend admin: `https://your-backend-name.onrender.com/admin/`
- AI health: `https://your-ai-service-name.onrender.com/health`

### Deployment Notes

- Render Blueprints require the project to live in a Git repository.
- This free deployment path uses synchronous review execution instead of a Celery worker.
- The AI service is deployed as a free Render web service instead of a private service.
- The Django backend uses Gunicorn and WhiteNoise in production for admin/static asset serving.
- Vercel is configured as a Vite SPA, so client-side routes like `/reviews/123` resolve correctly.

## GitHub OAuth Setup

1. Open GitHub Developer Settings.
2. Create a new OAuth App.
3. Set Homepage URL to `http://localhost:3000`.
4. Set Authorization callback URL to `http://localhost:3000/auth/github`.
5. Copy the client ID and client secret into `.env`.
6. Ensure the account used to connect repositories has `repo` access.

## Anthropic API Setup

1. Create an Anthropic API key in the Anthropic console.
2. Add the value to `ANTHROPIC_API_KEY` in `.env`.
3. Restart the stack so the AI service picks up the new value.

## API Endpoints

| Area | Method | Endpoint | Description |
| --- | --- | --- | --- |
| Auth | POST | `/api/auth/register/` | Create a user and issue JWT tokens |
| Auth | POST | `/api/auth/login/` | Obtain access and refresh tokens |
| Auth | POST | `/api/auth/refresh/` | Refresh access token |
| Auth | GET | `/api/auth/me/` | Get current user |
| Auth | POST | `/api/auth/github/` | Exchange GitHub OAuth code for JWT |
| Projects | GET/POST | `/api/projects/repos/` | List or connect repositories |
| Projects | GET/DELETE | `/api/projects/repos/{id}/` | Repository detail or disconnect |
| Projects | POST | `/api/projects/repos/{id}/sync_prs/` | Sync open pull requests |
| Projects | GET | `/api/projects/prs/` | List pull requests |
| Projects | GET | `/api/projects/prs/{id}/` | Pull request detail |
| Reviews | GET | `/api/reviews/{pr_id}/` | Get review for a pull request |
| Reviews | POST | `/api/reviews/{pr_id}/trigger/` | Run a manual review |
| Reviews | GET | `/api/reviews/stats/` | Dashboard stats |
| Webhooks | POST | `/api/webhooks/github/` | GitHub pull request webhook |

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, Vite, TailwindCSS, React Router, React Query, Monaco |
| Backend | Django 4.2, DRF, SimpleJWT |
| AI Service | FastAPI, Anthropic SDK, httpx |
| Database | PostgreSQL 15 |
| DevOps | Docker, Docker Compose |

## Screenshots

- Dashboard screenshot placeholder
- Repository management screenshot placeholder
- Review detail screenshot placeholder

## License

MIT
