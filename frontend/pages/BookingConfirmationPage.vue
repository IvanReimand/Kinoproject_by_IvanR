
<template>
  <div class="container">
    <div class="confirmation-card">
      <div class="success-header">
        <h1>✅ Booking Confirmed!</h1>
        <p class="subtitle">Your ticket is reserved</p>
        <p v-if="movieTitle" class="subheading">Movie: {{ movieTitle }}</p>
      </div>

      <div v-if="!bookingData" class="error-message">
        <p>No booking data found. Please go back and complete your booking.</p>
        <button class="primary-btn" @click="$router.push('/booking')">← Back to Booking</button>
      </div>

      <div v-else>
        <!--\n        BOOKING CONFIRMATION DETAILS SECTIONS\n        Displays all booking information organized in multiple sections\n        Each section shows different aspects of the booking\n        -->
        <!-- Session Information -->
        <div class="confirmation-section" v-if="sessionData">
          <h2>🕐 Session Details</h2>
          <div class="section-content">
            <div class="info-row">
              <span class="label">Time:</span>
              <span class="value">{{ sessionData.time }} ({{ sessionData.period }})</span>
            </div>
            <div class="info-row">
              <span class="label">Hall:</span>
              <span class="value">{{ sessionData.hall }}</span>
            </div>
            <div class="info-row">
              <span class="label">Duration:</span>
              <span class="value">{{ sessionData.duration }}</span>
            </div>
            <div class="info-row">
              <span class="label">Features:</span>
              <span class="value">4K Projection, Dolby Atmos, Premium Seats</span>
            </div>
          </div>
        </div>

        <!-- Movie Information -->
        <div class="confirmation-section" v-if="movieTitle">
          <h2>🎬 Movie Details</h2>
          <div class="section-content">
            <div class="info-row">
              <span class="label">Title:</span>
              <span class="value">{{ movieTitle }}</span>
            </div>
            <div class="info-row" v-if="movieDetails">
              <span class="label">Genre:</span>
              <span class="value">{{ movieDetails.genre }}</span>
            </div>
            <div class="info-row" v-if="movieDetails">
              <span class="label">Duration:</span>
              <span class="value">{{ movieDetails.duration_min }} min</span>
            </div>
          </div>
        </div>

        <!-- Client Information -->
        <div class="confirmation-section">
          <h2>👤 Your Information</h2>
          <div class="section-content">
            <div class="info-row">
              <span class="label">Name:</span>
              <span class="value">{{ bookingData.user.name }}</span>
            </div>
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">{{ bookingData.user.email }}</span>
            </div>
            <div class="info-row" v-if="bookingData.user.phone">
              <span class="label">Phone:</span>
              <span class="value">{{ bookingData.user.phone }}</span>
            </div>
          </div>
        </div>

        <!-- Seat Information -->
        <div class="confirmation-section">
          <h2>🎫 Selected Seats</h2>
          <div class="section-content">
            <div class="seats-display">
              <span v-for="(seat, index) in bookingData.seats" :key="index" class="seat-badge">
                {{ seat }}
              </span>
            </div>
            <div class="info-row">
              <span class="label">Total Seats:</span>
              <span class="value">{{ bookingData.seats.length }}</span>
            </div>
          </div>
        </div>

        <!-- Price Information -->
        <div class="confirmation-section price-section">
          <h2>💰 Price</h2>
          <div class="section-content">
            <div class="info-row">
              <span class="label">Price per seat:</span>
              <span class="value">{{ pricePerSeat }} EUR</span>
            </div>
            <div class="info-row total">
              <span class="label">Total:</span>
              <span class="value">{{ totalPrice }} EUR</span>
            </div>
          </div>
        </div>

        <!-- Booking Reference -->
        <div class="confirmation-section">
          <div class="booking-reference">
            <p><strong>Booking Reference:</strong> {{ bookingReference }}</p>
            <p class="small-text">Keep this reference for your records</p>
          </div>
        </div>

        <!-- Status Messages -->
        <div v-if="message" :class="['status-message', { 'success': success, 'error': !success }]">
          {{ message }}
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <!-- PDF Download button - allows user to download ticket as PDF file -->
          <button class="secondary-btn" @click="downloadPDF" :disabled="loading">
            📥 Download Ticket (PDF)
          </button>
          <!-- Navigate back to movies list -->
          <button class="tertiary-btn" @click="$router.push('/')">
            ← Back to Movies
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import Vue 3 composition API functions
import { ref, computed, onMounted } from 'vue'
// Import Vue Router for navigation
import { useRouter } from 'vue-router'
// Import Axios for HTTP requests
import axios from 'axios'

// Get router instance for navigation
const router = useRouter()
// Store booking data retrieved from localStorage
const bookingData = ref(null)
// Store fetched movie details from API
const movieDetails = ref(null)
// Track loading state during API requests
const loading = ref(false)
// Store status messages for user feedback
const message = ref('')
// Track whether last operation was successful or failed
const success = ref(false)

// Price per seat in EUR
const pricePerSeat = ref(12)

// Computed property to calculate total price from number of seats
const totalPrice = computed(() => {
  // Return 0 if no booking data available
  if (!bookingData.value) return 0
  // Calculate total by multiplying seat count by price per seat
  return (bookingData.value.seats.length * pricePerSeat.value).toFixed(2)
})

// Computed property to generate or retrieve unique booking reference
const bookingReference = computed(() => {
  // Return empty string if no booking data
  if (!bookingData.value) return ''
  // Use booking ID from API response if available
  if (bookingData.value.bookingId) {
    return bookingData.value.bookingId
  }
  // Otherwise generate reference from timestamp and seat count
  const timestamp = new Date(bookingData.value.timestamp).getTime().toString().slice(-6)
  return `BOOK-${timestamp}-${bookingData.value.seats.length}SEATS`
})

// Computed property to get session details from booking or user data
const sessionData = computed(() => {
  // Return null if no booking data
  if (!bookingData.value) return null
  // Return session from booking data or user data or null
  return bookingData.value.session || bookingData.value.user?.session || null
})

// Computed property to get movie title from booking, user data, or fetched details
const movieTitle = computed(() => {
  // Return empty string if no booking data
  if (!bookingData.value) return ''
  // Try to get movie title from booking, user data, or movie details
  return bookingData.value.movie || bookingData.value.user?.movie || movieDetails.value?.title || ''
})

// Lifecycle hook - Load booking data from localStorage and fetch movie details
onMounted(() => {
  // Try to retrieve booking data from localStorage
  const saved = localStorage.getItem('cinemaBooking')
  // If booking data exists, parse and use it
  if (saved) {
    // Store parsed booking data in reactive variable
    bookingData.value = JSON.parse(saved)
    // Fetch additional movie details from API
    fetchMovieDetails()
  }
})

// Function to fetch full movie details by searching all movies by title
const fetchMovieDetails = async () => {
  try {
    // Fetch all movies from backend API
    const allMovies = await axios.get('http://localhost:3001/api/movies')
    // Find movie by matching the title from booking data
    const movie = allMovies.data.find(m => m.title === bookingData.value.movie)
    // If movie found, store full movie details
    if (movie) {
      movieDetails.value = movie
    }
  } catch (error) {
    // Log error if API request fails
    console.error('Error fetching movie details:', error)
  }
}

// Function to send ticket confirmation email to customer
const sendEmailReceipt = async () => {
  // Do nothing if no booking data available
  if (!bookingData.value) return

  // Set loading state while sending email
  loading.value = true
  // Clear any previous messages
  message.value = ''

  try {
    // Prepare email payload with booking information
    const payload = {
      email: bookingData.value.user.email, // Customer email address
      clientName: bookingData.value.user.name, // Customer name
      movieTitle: bookingData.value.movie, // Movie title
      seats: bookingData.value.seats, // Booked seat IDs
      totalPrice: totalPrice.value, // Total booking price
      bookingReference: bookingReference.value, // Unique booking reference
      movieDetails: movieDetails.value, // Full movie information
      session: bookingData.value.session // Session details
    }

    // Send email via backend API
    const response = await axios.post('http://localhost:3001/api/send-ticket-email', payload)

    // Set success state and confirmation message
    success.value = true
    message.value = `✅ Ticket sent successfully to ${bookingData.value.user.email}`
    
    // Clear booking data from localStorage after sending email
    setTimeout(() => {
      localStorage.removeItem('cinemaBooking')
    }, 2000)
  } catch (error) {
    success.value = false
    message.value = `❌ Failed to send email: ${error.response?.data?.error || error.message}`
  } finally {
    loading.value = false
  }
}

import jsPDF from 'jspdf';

// Function to generate and download PDF ticket
const downloadPDF = async () => {
  // Do nothing if no booking data available
  if (!bookingData.value) return;

  // Set loading state while generating PDF
  loading.value = true;
  // Clear any previous messages
  message.value = '';

  try {
    // Get session data from computed property
    const session = sessionData.value
    // Create new PDF document instance
    const doc = new jsPDF();
    
    // Add main title to PDF
    doc.setFontSize(20);
    doc.text('Cinema Ticket', 105, 20, { align: 'center' });
    
    // Set smaller font for details
    doc.setFontSize(12);
    // Add booking reference
    doc.text(`Booking Reference: ${bookingReference.value}`, 20, 50);
    // Add customer name
    doc.text(`Client: ${bookingData.value.user.name}`, 20, 65);
    // Add customer email
    doc.text(`Email: ${bookingData.value.user.email}`, 20, 80);
    // Add movie title
    doc.text(`Movie: ${movieTitle.value}`, 20, 95);
    // Add session and seat information if session exists
    if (session) {
      // Add session time and period
      doc.text(`Session: ${session.time} (${session.period})`, 20, 110);
      // Add cinema hall number
      doc.text(`Hall: ${session.hall}`, 20, 125);
      // Add movie duration
      doc.text(`Duration: ${session.duration}`, 20, 140);
      // Add list of booked seats
      doc.text(`Seats: ${bookingData.value.seats.join(', ')}`, 20, 155);
      // Add total price
      doc.text(`Total Price: ${totalPrice.value} EUR`, 20, 170);
    } else {
      // Fallback layout if no session info
      doc.text(`Seats: ${bookingData.value.seats.join(', ')}`, 20, 110);
      doc.text(`Total Price: ${totalPrice.value} EUR`, 20, 125);
    }
    
    // Trigger PDF download with booking reference as filename
    doc.save(`ticket-${bookingReference.value}.pdf`);
    
    // Set success state and message
    success.value = true;
    message.value = '✅ PDF downloaded successfully!';
  } catch (error) {
    // Set error state if PDF generation fails
    success.value = false;
    message.value = `❌ Failed to download PDF: ${error.message}`;
  } finally {
    // Always turn off loading state
    loading.value = false;
  }
};
</script>

<style scoped>
.container {
  max-width: 700px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.confirmation-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solid #00d4ff;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 212, 255, 0.1);
}

.success-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #00d4ff;
}

.success-header h1 {
  color: #00d4ff;
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #aaa;
  margin: 0;
  font-size: 1rem;
}

.confirmation-section {
  margin-bottom: 1.75rem;
  padding: 1.25rem;
  background: rgba(0, 212, 255, 0.05);
  border-left: 3px solid #00d4ff;
  border-radius: 8px;
}

.confirmation-section h2 {
  color: #00d4ff;
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.info-row.total {
  border-top: 1px solid #444;
  padding-top: 1rem;
  margin-top: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.label {
  color: #aaa;
  font-weight: 500;
}

.value {
  color: #fff;
  font-weight: 600;
}

.seats-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.seat-badge {
  background: #00d4ff;
  color: #000;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
}

.price-section {
  background: rgba(0, 212, 255, 0.1);
  border-left: 3px solid #00ff00;
}

.price-section h2 {
  color: #00ff00;
}

.booking-reference {
  background: rgba(0, 255, 0, 0.05);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #00ff00;
}

.booking-reference p {
  margin: 0.5rem 0;
  color: #fff;
}

.small-text {
  color: #aaa;
  font-size: 0.85rem;
}

.status-message {
  padding: 1rem;
  border-radius: 8px;
  margin: 1.5rem 0;
  text-align: center;
  font-weight: 600;
}

.status-message.success {
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  color: #00ff00;
}

.status-message.error {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid #ff0000;
  color: #ff0000;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 2rem;
}

.primary-btn,
.secondary-btn,
.tertiary-btn {
  border: none;
  border-radius: 10px;
  padding: 1rem;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.primary-btn {
  background: #00d4ff;
  color: #000;
}

.primary-btn:hover:not(:disabled) {
  background: #00b8d4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
}

.primary-btn:disabled {
  background: #666;
  color: #aaa;
  cursor: not-allowed;
}

.secondary-btn {
  background: #444;
  color: #fff;
  border: 1px solid #666;
}

.secondary-btn:hover:not(:disabled) {
  background: #555;
  border-color: #00d4ff;
}

.tertiary-btn {
  background: transparent;
  color: #aaa;
  border: 1px solid #666;
}

.tertiary-btn:hover {
  background: #222;
  border-color: #aaa;
  color: #fff;
}

.error-message {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid #ff0000;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.error-message p {
  color: #ff6b6b;
  margin: 0 0 1rem 0;
}
</style>
