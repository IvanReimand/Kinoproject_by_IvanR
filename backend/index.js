const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

let useDatabase = true;
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cinema_db',
});

async function initDatabase() {
  try {
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL database.');
  } catch (error) {
    useDatabase = false;
    console.warn('PostgreSQL connection failed. Using fallback static movie data.');
    console.warn(error.message);
  }
}

initDatabase();

// Routes

// GET all movies
app.get('/api/movies', async (req, res) => {
  try {
    if (!useDatabase) {
      return res.json(moviesData);
    }

    const result = await pool.query('SELECT * FROM movies ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single movie by ID
app.get('/api/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!useDatabase) {
      const movie = moviesData.find((item) => item.id === Number(id));
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      return res.json(movie);
    }

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
