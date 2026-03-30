# Ayesha Zahid Personal Dashboard

A private personal-use website for **Ayesha Zahid** with:
- login by email and password
- personal dashboard
- image upload
- driving video upload
- saved project history
- downloadable result section
- password change page
- Railway deployment support

## Important note
This project is a **safe personal dashboard template**. The current version stores the uploaded image and video and saves a result entry by copying the uploaded video into the output section so the whole product remains simple, stable, and easy to deploy.

If later you want, a **consent-based external avatar/video generation API** can be connected inside `routes/dashboard.js` where the result file is created.

## Tech stack
- Node.js
- Express
- EJS templates
- Multer uploads
- Express sessions
- JSON file storage

## Local run

### 1) Extract the zip
Unzip the project folder.

### 2) Install dependencies
```bash
npm install
```

### 3) Create env file
Copy `.env.example` to `.env`

Example:
```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=change-this-to-a-long-random-secret
ADMIN_NAME=Ayesha Zahid
ADMIN_EMAIL=ayesha@example.com
ADMIN_PASSWORD=ChangeThisPassword123!
APP_TITLE=Ayesha Zahid Personal Dashboard
```

### 4) Start
```bash
npm start
```

### 5) Open in browser
```text
http://localhost:3000
```

## Default first login
Use the values from your `.env` file:
- Email = `ADMIN_EMAIL`
- Password = `ADMIN_PASSWORD`

## GitHub upload steps
1. Create a new GitHub repository
2. Upload all extracted files
3. Commit and push

Suggested repository name:
```text
ayesha-zahid-personal-dashboard
```

## Railway deployment steps
1. Login to Railway
2. Click **New Project**
3. Choose **Deploy from GitHub Repo**
4. Select your repository
5. Railway auto-detects Node.js
6. Add the environment variables from `.env.example`
7. Deploy

## Railway fields to fill
Use these values:

### Project / Service Name
`Ayesha Zahid Personal Dashboard`

### Environment Variables
- `PORT` = `3000`
- `NODE_ENV` = `production`
- `SESSION_SECRET` = any long random secret
- `ADMIN_NAME` = `Ayesha Zahid`
- `ADMIN_EMAIL` = your chosen login email
- `ADMIN_PASSWORD` = your chosen strong password
- `APP_TITLE` = `Ayesha Zahid Personal Dashboard`

### Build Command
Railway usually auto-detects this. If asked:
```bash
npm install
```

### Start Command
```bash
npm start
```

### Root Directory
Leave blank if the project is at repo root.

## Files and folders
- `server.js` → main server
- `routes/` → login and dashboard routes
- `views/` → EJS pages
- `public/` → CSS, uploaded files, outputs
- `data/` → JSON storage
- `railway.json` → Railway config

## Personalization ideas you can add later
- Urdu language toggle
- dark mode switch
- cloud file storage
- external video generation API
- email verification
- 2-factor login

## Honest limitation
I cannot truthfully promise that **no bug will ever appear later**, because that is never guaranteed in software. But I built this package to be **simple, runnable, and low-risk**, and structured it to reduce deployment problems on Railway.
