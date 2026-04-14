/*
  Cinema Web App Backend - Express.js Server
  Features:
  - RESTful API for movie management
  - PostgreSQL database integration with fallback to static data
  - CRUD operations: Create, Read, Delete movies
  - Protection for original movies (ID 1-10 cannot be deleted)
*/

// Import required modules
const express = require('express'); // Web framework for Node.js
const cors = require('cors'); // Enable Cross-Origin Resource Sharing
const { Pool } = require('pg'); // PostgreSQL client for database operations
require('dotenv').config(); // Load environment variables from .env file

// Create Express application instance
const app = express();

// Middleware setup
app.use(cors()); // Allow cross-origin requests from frontend
app.use(express.json()); // Parse JSON request bodies

// Static movie data - fallback when database is unavailable
// Contains 10 original movies that cannot be deleted
const moviesData = [
  { id: 1, title: 'Guest from the Future', duration_min: 136, genre: 'sci-fi', rating: 7.8, release_year: 1984, country: 'Soviet Union', image: 'Gostizbud.jpg' },
  { id: 2, title: 'The Diamond Arm', duration_min: 100, genre: 'comedy', rating: 8.2, release_year: 1968, country: 'Soviet Union', image: 'diamarm.jpg' },
  { id: 3, title: 'Pirates of the Caribbean', duration_min: 143, genre: 'adventure', rating: 8.0, release_year: 2003, country: 'USA', image: 'piratcarrib.jpg' },
  { id: 4, title: 'Titanic', duration_min: 194, genre: 'romance', rating: 8.1, release_year: 1997, country: 'USA', image: 'titanic.jpg' },
  { id: 5, title: 'You Never Even Dreamed', duration_min: 90, genre: 'romance', rating: 7.9, release_year: 1980, country: 'Soviet Union', image: 'vamine.jpg' },
  { id: 6, title: 'Kidnapping, Caucasian Style', duration_min: 82, genre: 'comedy', rating: 8.0, release_year: 1967, country: 'Soviet Union', image: 'kavkazpl.jpg' },
  { id: 7, title: 'The Twelve Chairs', duration_min: 160, genre: 'comedy', rating: 7.9, release_year: 1971, country: 'Soviet Union', image: '12st.jpg' },
  { id: 8, title: 'Avatar', duration_min: 162, genre: 'sci-fi', rating: 8.1, release_year: 2009, country: 'USA', image: 'avatar1.jpg' },
  { id: 9, title: 'Fortress of War', duration_min: 138, genre: 'war', rating: 7.7, release_year: 2010, country: 'Russia', image: 'brestkr.png' },
  { id: 10, title: 'Summer of 1941', duration_min: 110, genre: 'war', rating: 7.5, release_year: 2022, country: 'Russia', image: 'l1941.jpg' },
];

// Database connection flag - determines whether to use PostgreSQL or fallback data
let useDatabase = true;

// PostgreSQL connection pool configuration
// Uses environment variables with fallback defaults
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cinema_db',
});

// Database initialization function
// Tests connection and sets useDatabase flag
async function initDatabase() {
  try {
    // Test database connection with simple query
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL database.');
  } catch (error) {
    // If connection fails, disable database usage
    useDatabase = false;
    console.warn('PostgreSQL connection failed. Using fallback static movie data.');
    console.warn(error.message);
  }
}

// Initialize database connection on startup
initDatabase();

// ===== API ROUTES =====

// GET /api/movies - Retrieve all movies
app.get('/api/movies', async (req, res) => {
  try {
    // If database is not available, return static data
    if (!useDatabase) {
      return res.json(moviesData);
    }

    // Query database for all movies ordered by ID
    const result = await pool.query('SELECT * FROM movies ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/movies/:id - Retrieve single movie by ID
app.get('/api/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // If database is not available, search in static data
    if (!useDatabase) {
      const movie = moviesData.find((item) => item.id === Number(id));
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      return res.json(movie);
    }

    // Query database for specific movie by ID
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/movies - Add new movie
app.post('/api/movies', async (req, res) => {
  try {
    // Extract movie data from request body
    const { title, duration_min, genre, rating, release_year, country, image } = req.body;

    // Validate that all required fields are provided
    if (!title || !duration_min || !genre || !rating || !release_year || !country) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If database is available, insert into PostgreSQL
    if (useDatabase) {
      // SQL query to insert new movie and return the inserted row
      const query = `
        INSERT INTO movies (title, duration_min, genre, rating, release_year, country, image)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      // Parameterized query values to prevent SQL injection
      const values = [title, duration_min, genre, rating, release_year, country, image || null];

      const result = await pool.query(query, values);
      return res.status(201).json(result.rows[0]);
    }

    // Fallback to in-memory array when database is not available
    // Generate new ID by finding the maximum existing ID and adding 1
    const newId = Math.max(...moviesData.map(m => m.id)) + 1;

    // Create new movie object with proper data types
    const newMovie = {
      id: newId,
      title,
      duration_min: Number(duration_min),
      genre,
      rating: Number(rating),
      release_year: Number(release_year),
      country,
      image: image || null
    };

    // Add new movie to in-memory array
    moviesData.push(newMovie);
    return res.status(201).json(newMovie);
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/movies/:id - Delete movie by ID (only for movies with ID > 10)
app.delete('/api/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const movieId = Number(id);

    // Security check: Prevent deletion of original movies (ID 1-10)
    if (movieId <= 10) {
      return res.status(403).json({ error: 'Cannot delete original movies' });
    }

    // If database is available, delete from PostgreSQL
    if (useDatabase) {
      // Delete query that returns the deleted row for confirmation
      const result = await pool.query('DELETE FROM movies WHERE id = $1 RETURNING *', [movieId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      
      return res.json({ message: 'Movie deleted successfully', movie: result.rows[0] });
    }

    // Fallback to in-memory array when database is not available
    // Find movie index in array
    const movieIndex = moviesData.findIndex(movie => movie.id === movieId);
    
    if (movieIndex === -1) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Remove movie from array and return it
    const deletedMovie = moviesData.splice(movieIndex, 1)[0];
    return res.json({ message: 'Movie deleted successfully', movie: deletedMovie });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/health - Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling middleware - catches any unhandled errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Server startup
const PORT = process.env.PORT || 3001; // Use environment port or default to 3001
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
