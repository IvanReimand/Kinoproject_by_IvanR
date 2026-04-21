/*
  Cinema Web App Backend - Express.js Server
  Features:
  - RESTful API for movie management
  - PostgreSQL database integration with fallback to static data
  - CRUD operations: Create, Read, Delete movies
  - Protection for original movies (ID 1-10 cannot be deleted)
*/
// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'user1111',
  database: 'cinema_db',
});

connection.connect((err) => {
  if (err) {
    console.error('Ошибка подключения:', err);
  } else {
    console.log('Подключено к MySQL');
  }
});

module.exports = connection;

// Import required modules
const express = require('express'); // Web framework for Node.js
const cors = require('cors'); // Enable Cross-Origin Resource Sharing
const { Pool } = require('pg'); // PostgreSQL client for database operations
const PDFDocument = require('pdfkit');
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

// ===== SEAT BOOKING MANAGEMENT =====

// In-memory storage for bookings (fallback when database is unavailable)
// Structure: { "movie_title": { "screening_id": ["A1", "A2", "B3"] } }
const bookings = {};

// GET /api/reserved-seats - Get all reserved seats for a screening
app.get('/api/reserved-seats', async (req, res) => {
  try {
    const { movieTitle, screeningId } = req.query;

    // Validate required parameters
    if (!movieTitle) {
      return res.status(400).json({ error: 'movieTitle parameter is required' });
    }

    const key = screeningId || 'default';

    // Return reserved seats from in-memory storage
    // Structure allows multiple screenings per movie
    const reservedSeats = (bookings[movieTitle] && bookings[movieTitle][key]) || [];

    res.json({ 
      movieTitle, 
      screeningId: key,
      reservedSeats,
      totalReserved: reservedSeats.length 
    });
  } catch (error) {
    console.error('Error fetching reserved seats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/book-seats - Book seats for a screening
app.post('/api/book-seats', async (req, res) => {
  try {
    const { movieTitle, screeningId, seats, clientName, clientEmail } = req.body;

    // Validate required fields
    if (!movieTitle || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: 'Invalid request: movieTitle and seats array are required' });
    }

    const key = screeningId || 'default';

    // Initialize movie booking object if it doesn't exist
    if (!bookings[movieTitle]) {
      bookings[movieTitle] = {};
    }
    if (!bookings[movieTitle][key]) {
      bookings[movieTitle][key] = [];
    }

    // Check if any requested seats are already booked
    const alreadyBooked = seats.filter(seat => 
      bookings[movieTitle][key].includes(seat)
    );

    if (alreadyBooked.length > 0) {
      return res.status(409).json({ 
        error: 'Some seats are already booked',
        alreadyBooked,
        message: `The following seats cannot be booked: ${alreadyBooked.join(', ')}`
      });
    }

    // Add seats to booking
    bookings[movieTitle][key] = [...bookings[movieTitle][key], ...seats];

    console.log(`✅ Booked ${seats.length} seats for ${movieTitle}:`, seats);

    // Save to database if available
    if (useDatabase) {
      try {
        // This would insert into the tickets table
        // For now, just log that it would be saved
        console.log('Booking would be saved to database');
      } catch (dbError) {
        console.warn('Could not save booking to database:', dbError.message);
      }
    }

    res.json({ 
      success: true,
      message: `Successfully booked ${seats.length} seats`,
      movieTitle,
      screeningId: key,
      bookedSeats: seats,
      totalBookedNow: bookings[movieTitle][key].length
    });
  } catch (error) {
    console.error('Error booking seats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/clear-bookings - Clear all bookings (admin/testing only)
app.get('/api/clear-bookings', (req, res) => {
  // Clear all bookings
  for (const movie in bookings) {
    delete bookings[movie];
  }
  console.log('🔄 All bookings cleared');
  res.json({ message: 'All bookings cleared', bookings });
});

// ===== EMAIL & BOOKING ENDPOINTS =====

// POST /api/send-ticket-email - Send ticket receipt via email
app.post('/api/send-ticket-email', async (req, res) => {
  try {
    const { email, clientName, movieTitle, seats, totalPrice, bookingReference, movieDetails, session } = req.body;

    // Validate required fields
    if (!email || !clientName || !movieTitle || !seats || !totalPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Import nodemailer
    const nodemailer = require('nodemailer');

    // Configure email transporter
    // For production, use real email service (Gmail, SendGrid, etc.)
    // For testing, you can use Ethereal (temporary test accounts)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true' || false,
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
      }
    });

    // Generate HTML email template
    const seatsHTML = seats.map(seat => `<span style="background:#00d4ff;color:#000;padding:4px 8px;border-radius:4px;font-weight:bold;margin:2px;">${seat}</span>`).join(' ');
    
    const movieInfo = movieDetails ? `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Genre:</strong></td>
        <td style="padding:8px;border-bottom:1px solid #ddd;">${movieDetails.genre}</td>
      </tr>
      <tr>
        <td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Duration:</strong></td>
        <td style="padding:8px;border-bottom:1px solid #ddd;">${movieDetails.duration_min} minutes</td>
      </tr>
      <tr>
        <td style="padding:8px;border-bottom:1px solid #ddd;"><strong>Rating:</strong></td>
        <td style="padding:8px;border-bottom:1px solid #ddd;">⭐ ${movieDetails.rating}/10</td>
      </tr>
    ` : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; color: #333; }
          .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #00d4ff; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px; }
          .section { margin-bottom: 25px; }
          .section h2 { color: #00d4ff; border-bottom: 2px solid #00d4ff; padding-bottom: 10px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          td:first-child { font-weight: bold; width: 35%; }
          .seats-container { background: #f9f9f9; padding: 15px; border-radius: 4px; margin: 10px 0; }
          .total { font-size: 18px; font-weight: bold; color: #00d4ff; background: #f0f0f0; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .reference { background: #e8f5e9; padding: 15px; border-left: 4px solid #00ff00; border-radius: 4px; margin: 15px 0; }
          .reference p { margin: 5px 0; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎬 Ticket Confirmation</h1>
            <p>Your cinema booking is confirmed!</p>
          </div>
          <div class="content">
            <div class="section">
              <h2>👤 Client Information</h2>
              <table>
                <tr>
                  <td>Name:</td>
                  <td>${clientName}</td>
                </tr>
                <tr>
                  <td>Email:</td>
                  <td>${email}</td>
                </tr>
              </table>
            </div>

            <div class="section">
              <h2>🎥 Movie Details</h2>
              <table>
                <tr>
                  <td>Title:</td>
                  <td><strong>${movieTitle}</strong></td>
                </tr>
                ${movieInfo}
              </table>
            </div>

            ${session ? `
            <div class="section">
              <h2>🕐 Session Details</h2>
              <table>
                <tr>
                  <td>Time:</td>
                  <td><strong>${session.time} (${session.period})</strong></td>
                </tr>
                <tr>
                  <td>Hall:</td>
                  <td>${session.hall}</td>
                </tr>
                <tr>
                  <td>Duration:</td>
                  <td>${session.duration}</td>
                </tr>
                <tr>
                  <td>Features:</td>
                  <td>4K Projection, Dolby Atmos, Premium Seats</td>
                </tr>
              </table>
            </div>
            ` : ''}

            <div class="section">
              <h2>🎫 Your Seats</h2>
              <div class="seats-container">
                ${seatsHTML}
              </div>
              <p><strong>Total Seats: ${seats.length}</strong></p>
            </div>

            <div class="section">
              <h2>💰 Price</h2>
              <div class="total">
                Total Price: €${totalPrice}
              </div>
            </div>

            <div class="reference">
              <p><strong>Booking Reference: ${bookingReference}</strong></p>
              <p style="color: #666; font-size: 12px;">Please keep this reference for your records. Show this email at the cinema entrance.</p>
            </div>

            <div class="section">
              <p style="color: #999; font-size: 14px;">
                Thank you for choosing our cinema! We hope you enjoy the movie. 
                If you have any questions, please contact our customer service.
              </p>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 Cinema Booking System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@cinema.local',
      to: email,
      subject: `🎬 Your Cinema Ticket - ${movieTitle}`,
      html: htmlContent,
      text: `Booking Reference: ${bookingReference}\nMovie: ${movieTitle}\nSeats: ${seats.join(', ')}\nTotal: €${totalPrice}`
    });

    console.log('Email sent successfully:', info.messageId);
    
    // Save booking to database if available
    if (useDatabase) {
      try {
        // This would save the booking to the tickets table
        // Implementation depends on your exact database structure
        console.log('Booking would be saved to database');
      } catch (dbError) {
        console.warn('Could not save booking to database:', dbError.message);
      }
    }

    res.json({ 
      success: true, 
      message: 'Ticket sent successfully', 
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
});

// POST /api/download-ticket-pdf - Generate and download PDF ticket
app.post('/api/download-ticket-pdf', async (req, res) => {
  try {
    const { email, clientName, movieTitle, seats, totalPrice, bookingReference, movieDetails } = req.body;

    // Validate required fields
    if (!email || !clientName || !movieTitle || !seats || !totalPrice || !bookingReference) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${bookingReference}.pdf"`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Add content to PDF
    // Header
    doc.fontSize(24).fillColor('#00d4ff').text('🎬 CINEMA TICKET', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).fillColor('#333').text('Your booking is confirmed!', { align: 'center' });
    doc.moveDown(2);

    // Client Information
    doc.fontSize(14).fillColor('#00d4ff').text('👤 Client Information');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#333');
    doc.text(`Name: ${clientName}`);
    doc.text(`Email: ${email}`);
    doc.moveDown();

    // Movie Details
    doc.fontSize(14).fillColor('#00d4ff').text('🎥 Movie Details');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#333');
    doc.text(`Title: ${movieTitle}`);
    if (movieDetails) {
      doc.text(`Genre: ${movieDetails.genre}`);
      doc.text(`Duration: ${movieDetails.duration_min} minutes`);
      doc.text(`Rating: ⭐ ${movieDetails.rating}/10`);
    }
    doc.moveDown();

    // Seats
    doc.fontSize(14).fillColor('#00d4ff').text('🎫 Your Seats');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#333');
    seats.forEach(seat => {
      doc.text(`• ${seat}`, { continued: false });
    });
    doc.text(`Total Seats: ${seats.length}`);
    doc.moveDown();

    // Price
    doc.fontSize(14).fillColor('#00d4ff').text('💰 Price');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#333');
    doc.text(`Total Price: €${totalPrice}`);
    doc.moveDown();

    // Booking Reference
    doc.fontSize(14).fillColor('#00d4ff').text('📋 Booking Reference');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#333');
    doc.text(bookingReference);
    doc.fontSize(10).fillColor('#666').text('Please keep this reference for your records. Show this ticket at the cinema entrance.');
    doc.moveDown(2);

    // Footer
    doc.fontSize(10).fillColor('#999').text('Thank you for choosing our cinema! We hope you enjoy the movie.', { align: 'center' });
    doc.moveDown(0.5);
    doc.text('© 2024 Cinema Booking System. All rights reserved.', { align: 'center' });

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      details: error.message 
    });
  }
});

// ===== SEAT MANAGEMENT ENDPOINTS =====

// GET /api/reserved-seats/:movieId - Get reserved seats for a movie
app.get('/api/reserved-seats/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    const { session } = req.query; // Get session time from query parameter

    if (!useDatabase) {
      // Return different reserved seats based on session time for testing
      const sessionSeats = {
        '12:00': ['A1', 'A2', 'B3', 'C5', 'D10'],
        '16:00': ['A5', 'B2', 'C8', 'D15', 'F12'],
        '20:00': ['A3', 'B7', 'C1', 'D20', 'E5']
      };
      return res.json(sessionSeats[session] || ['A1', 'A2', 'B3', 'C5']);
    }

    // Query database for reserved seats for this movie and session
    // This assumes you have a screenings table with start_time
    const query = `
      SELECT s.rownumber, s.seat_number
      FROM tickets t
      JOIN screenings sc ON t.screening_id = sc.id
      JOIN seats s ON t.seat_id = s.id
      WHERE sc.movie_id = $1 AND TIME(sc.start_time) = $2
    `;

    const result = await pool.query(query, [movieId, session + ':00']);
    const reservedSeats = result.rows.map(row => `${String.fromCharCode('A'.charCodeAt(0) + row.rownumber - 1)}${row.seat_number}`);

    res.json(reservedSeats);
  } catch (error) {
    console.error('Error fetching reserved seats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/reserve-seats - Reserve seats for a client
app.post('/api/reserve-seats', async (req, res) => {
  try {
    const { movieId, sessionTime, clientEmail, seats, clientName, clientPhone } = req.body;

    // Validate input
    if (!movieId || !sessionTime || !clientEmail || !seats || seats.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check seat limit (maximum 20 seats per client)
    if (seats.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 seats allowed per booking' });
    }

    if (!useDatabase) {
      // For testing without database, just return success
      console.log(`Reserved seats ${seats.join(', ')} for ${clientEmail} at session ${sessionTime}`);
      return res.json({
        success: true,
        message: 'Seats reserved successfully',
        bookingId: `TEST-${Date.now()}`
      });
    }

    // Start transaction
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Find or create client
      let clientResult = await client.query(
        'SELECT id FROM clients WHERE email = $1',
        [clientEmail]
      );

      let clientId;
      if (clientResult.rows.length === 0) {
        // Create new client
        const newClientResult = await client.query(
          'INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING id',
          [clientName, clientEmail, clientPhone || null]
        );
        clientId = newClientResult.rows[0].id;
      } else {
        clientId = clientResult.rows[0].id;
      }

      // Find screening for this movie and session time
      const screeningResult = await client.query(
        'SELECT id FROM screenings WHERE movie_id = $1 AND TIME(start_time) = $2',
        [movieId, sessionTime + ':00']
      );

      if (screeningResult.rows.length === 0) {
        throw new Error(`No screening found for this movie at ${sessionTime}`);
      }

      const screeningId = screeningResult.rows[0].id;

      // Reserve each seat
      for (const seat of seats) {
        // Parse seat (e.g., "A1" -> row 1, seat 1)
        const rowLetter = seat.charAt(0);
        const seatNumber = parseInt(seat.substring(1));
        const rowNumber = rowLetter.charCodeAt(0) - 'A'.charCodeAt(0) + 1;

        // Find seat ID
        const seatResult = await client.query(
          'SELECT id FROM seats WHERE rownumber = $1 AND seat_number = $2',
          [rowNumber, seatNumber]
        );

        if (seatResult.rows.length === 0) {
          throw new Error(`Seat ${seat} not found`);
        }

        const seatId = seatResult.rows[0].id;

        // Check if seat is already reserved
        const existingTicket = await client.query(
          'SELECT id FROM tickets WHERE screening_id = $1 AND seat_id = $2',
          [screeningId, seatId]
        );

        if (existingTicket.rows.length > 0) {
          throw new Error(`Seat ${seat} is already reserved`);
        }

        // Create ticket
        await client.query(
          'INSERT INTO tickets (screening_id, seat_id, client_id, price) VALUES ($1, $2, $3, $4)',
          [screeningId, seatId, clientId, 12.00] // €12 per seat
        );
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Seats reserved successfully',
        bookingId: `BOOK-${Date.now()}`
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error reserving seats:', error);
    res.status(500).json({
      error: 'Failed to reserve seats',
      details: error.message
    });
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
