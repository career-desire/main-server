# Main server

## Setup

```bash
git clone https://github.com/career-desire/main-server.git
cd main-server
npm install
npm run dev
```

## Build 

```bash
npm run build
```

## Project Structure

/src
│
├── config/            # MongoDB configuration
├── controllers/       # Endpoint functions
├── middleware/        # Authenticate client requests
├── models/            # Structure of MongoDB collections
├── routes/            # Attach endpoint function with routes     
└── utils/             # Utility functions (ai functions, cache prompt, token gerations)

## Environment Variables

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ADMIN_EMAIL=
PORT=
GEMINI_API_KEY=
MONGO_URI=""
CLIENT_URL=
NODE_ENV=production

## API Endpoints 

## Authentication Endpoints

POST /api/auth/validate-user
POST /api/auth/register
POST /api/auth/login 
GET /api/auth/me (Fetch log in user’s information)
POST /api/auth/refresh (Refresh access token if session expired)
POST /api/auth/forgot-password
POST /api/auth/verify-password
POST /api/auth/logout 

## Resume Endpoints

POST /api/resume/view-only/:id (View Shared resume)
POST /api/resume/ (Save new resume)
GET /api/resume/ (To get all saved resumes)
GET /api/resume/:id (To get specific resume)
PUT /api/resume/:id (To update specific resume)
DELETE /api/resume/:id (To delete specific resume)
POST /api/resume/upload (Generate AI resume by uploading existing resume)
POST /api/resume/ai-resume (Generate AI resume)
POST /api/resume/ai-resume-section (Generate specific resume section)

## Cover Letter Endpoints

POST /api/cover-letter/view-only/:id (View Shared resume)
POST /api/cover-letter/ (Save new cover letter)
GET /api/cover-letter/ (To get all saved cover letters)
GET /api/cover-letter/:id (To get specific cover letter)
PUT /api/cover-letter/:id (To update specific cover letter)
DELETE /api/cover-letter/:id (To delete specific cover letter)