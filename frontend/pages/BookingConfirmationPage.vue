<template>
  <div class="container">
    <div class="confirmation-card">
      <div class="success-header">
        <h1>✅ Booking Confirmed!</h1>
        <p class="subtitle">Your ticket is reserved</p>
      </div>

      <div v-if="!bookingData" class="error-message">
        <p>No booking data found. Please go back and complete your booking.</p>
        <button class="primary-btn" @click="$router.push('/booking')">← Back to Booking</button>
      </div>

      <div v-else>
        <!-- Movie Information -->
        <div class="confirmation-section">
          <h2>🎬 Movie Details</h2>
          <div class="section-content">
            <div class="info-row">
              <span class="label">Title:</span>
              <span class="value">{{ bookingData.movie }}</span>
            </div>
            <div class="info-row" v-if="movieDetails">
              <span class="label">Duration:</span>
              <span class="value">{{ movieDetails.duration_min }} minutes</span>
            </div>
            <div class="info-row" v-if="movieDetails">
              <span class="label">Genre:</span>
              <span class="value">{{ movieDetails.genre }}</span>
            </div>
            <div class="info-row" v-if="movieDetails">
              <span class="label">Rating:</span>
              <span class="value">⭐ {{ movieDetails.rating }}/10</span>
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
          
          <button class="secondary-btn" @click="downloadPDF" :disabled="loading">
            📥 Download Ticket (PDF)
          </button>
          <button class="tertiary-btn" @click="$router.push('/')">
            ← Back to Movies
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const bookingData = ref(null)
const movieDetails = ref(null)
const loading = ref(false)
const message = ref('')
const success = ref(false)

const pricePerSeat = ref(12)

const totalPrice = computed(() => {
  if (!bookingData.value) return 0
  return (bookingData.value.seats.length * pricePerSeat.value).toFixed(2)
})

const bookingReference = computed(() => {
  if (!bookingData.value) return ''
  const timestamp = new Date(bookingData.value.timestamp).getTime().toString().slice(-6)
  return `BOOK-${timestamp}-${bookingData.value.seats.length}SEATS`
})

onMounted(() => {
  const saved = localStorage.getItem('cinemaBooking')
  if (saved) {
    bookingData.value = JSON.parse(saved)
    fetchMovieDetails()
  }
})

const fetchMovieDetails = async () => {
  try {
    // Get movie ID from movie title or use a default search
    const allMovies = await axios.get('http://localhost:3001/api/movies')
    const movie = allMovies.data.find(m => m.title === bookingData.value.movie)
    if (movie) {
      movieDetails.value = movie
    }
  } catch (error) {
    console.error('Error fetching movie details:', error)
  }
}

const sendEmailReceipt = async () => {
  if (!bookingData.value) return

  loading.value = true
  message.value = ''

  try {
    const payload = {
      email: bookingData.value.user.email,
      clientName: bookingData.value.user.name,
      movieTitle: bookingData.value.movie,
      seats: bookingData.value.seats,
      totalPrice: totalPrice.value,
      bookingReference: bookingReference.value,
      movieDetails: movieDetails.value
    }

    const response = await axios.post('http://localhost:3001/api/send-ticket-email', payload)

    success.value = true
    message.value = `✅ Ticket sent successfully to ${bookingData.value.user.email}`
    
    // Clear booking data after sending
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

const downloadPDF = async () => {
  if (!bookingData.value) return

  loading.value = true
  message.value = ''

  try {
    const payload = {
      email: bookingData.value.user.email,
      clientName: bookingData.value.user.name,
      movieTitle: bookingData.value.movie,
      seats: bookingData.value.seats,
      totalPrice: totalPrice.value,
      bookingReference: bookingReference.value,
      movieDetails: movieDetails.value
    }

    const response = await axios.post('http://localhost:3001/api/download-ticket-pdf', payload, {
      responseType: 'blob' // Important: response as blob for file download
    })

    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ticket-${bookingReference.value}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    success.value = true
    message.value = '✅ PDF downloaded successfully!'
  } catch (error) {
    success.value = false
    message.value = `❌ Failed to download PDF: ${error.response?.data?.error || error.message}`
  } finally {
    loading.value = false
  }
}
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
