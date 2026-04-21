# Cinema Web App

A modern cinema web application built with Vue.js, Express.js, and PostgreSQL.

## Features

- 📊 **Grid View**: Display movies in a responsive grid layout
- 📋 **List View**: Display movies in a detailed list format  
- 🎬 Movie Details: Title, Duration, Genre, Rating, Release Year, Country
- 🚀 RESTful API backend with Express.js
- 📱 Responsive design for mobile and desktop

## Project Structure

```
├── backend/
│   ├── index.js          # Express server with API routes
│   └── .env              # Database configuration
├── frontend/
│   ├── index.html        # HTML entry point
│   ├── main.js           # Vue app initialization
│   ├── App.vue           # Root Vue component
│   ├── vite.config.js    # Vite configuration
│   ├── style.css         # Global styles
│   ├── router/
│   │   └── index.js      # Vue Router configuration
│   ├── pages/
│   │   ├── MovieGridPage.vue   # Grid view page
│   │   └── MovieListPage.vue   # List view page
│   └── components/
│       └── MovieCard.vue       # Movie card component
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn

## Installation

### 1. Install dependencies

```bash
# Install main dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Database Setup

1. Create a PostgreSQL database named `cinema_db`
2. Run the SQL script to create tables:

```bash
psql -U postgres -d cinema_db -f "backend/db/schema.sql"
```

### 3. Configure Environment Variables

Edit `backend/.env` with your database credentials:

```
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cinema_db
PORT=3001
NODE_ENV=development
```

## Running the Application

### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
npm run dev
```
This starts the Express server on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
This starts the Vue dev server on http://localhost:5173

### Option 2: Run Both Together

```bash
npm run dev:all
```
Note: Requires `concurrently` package to be installed.

## API Endpoints

### Get All Movies
```http
GET /api/movies
```
Response: Array of movie objects

### Get Single Movie
```http
GET /api/movies/:id
```
Response: Single movie object

### Health Check
```http
GET /api/health
```
Response: `{ status: "OK" }`

## Movie Object Structure

```json
{
  "id": 1,
  "title": "Guest from the Future",
  "duration_min": 136,
  "genre": "sci-fi",
  "rating": 7.8,
  "release_year": 1984,
  "country": "Soviet Union"
}
```

## Styling

The app uses a dark theme inspired by Netflix with:
- Primary color: Red (#e50914)
- Dark background: #1a1a1a
- Responsive grid layout
- Smooth hover effects

## Technologies Used

- **Frontend**: Vue 3, Vue Router, Axios, Vite
- **Backend**: Express.js, Node.js, Cors
- **Database**: PostgreSQL
- **Other**: dotenv for environment variables

## Development

### Backend Commands

- `npm start` - Run production server
- `npm run dev` - Run with automatic reload on changes

### Frontend Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

ISC

## Author

Ivan Reimand
