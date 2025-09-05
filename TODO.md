# TODO: Add Backend and Database to MovieTracker

## Backend Setup
- [x] Create backend directory
- [x] Initialize package.json with dependencies (express, sqlite3, bcryptjs, jsonwebtoken, cors)
- [x] Create server.js with Express app setup
- [x] Set up SQLite database connection and schema (users, movies tables)

## Authentication
- [x] Implement user registration API (/api/register)
- [x] Implement user login API (/api/login) with JWT
- [x] Add JWT middleware for protected routes

## Movie APIs
- [x] Implement GET /api/movies (get user's movies)
- [x] Implement POST /api/movies (add movie)
- [x] Implement PUT /api/movies/:id (update movie)
- [x] Implement DELETE /api/movies/:id (delete movie)

## Frontend Updates
- [x] Modify login.html to call backend login API
- [x] Modify register.html to call backend register API
- [x] Modify script.js to use backend APIs instead of localStorage
- [x] Update authentication flow to use JWT tokens

## Testing and Deployment
- [ ] Test full user flow (register, login, add/edit/delete movies)
- [x] Update README.md with backend setup instructions
- [x] Add package.json with start script
