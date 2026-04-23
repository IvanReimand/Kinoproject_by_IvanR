<template>
  <div class="container">
    <div class="page-header">
      <button @click="$router.go(-1)" class="back-btn">← Back</button>
      <h2 class="page-title">🎟️ Book Your Seats</h2>
    </div>

    <div v-if="!registration" class="info-card">
      <p>Please complete registration first before booking seats.</p>
      <button class="secondary-btn" @click="goToRegister">Go to Registration</button>
    </div>

    <div v-else class="booking-card">
      <div class="user-summary">
        <div><strong>Name:</strong> {{ registration.name }}</div>
        <div><strong>Email:</strong> {{ registration.email }}</div>
        <div><strong>Movie:</strong> {{ registration.movie }}</div>
        <div v-if="registration.session"><strong>Session:</strong> {{ registration.session.time }} ({{ registration.session.period }}) - {{ registration.session.hall }}</div>
      </div>

      <div class="seat-map">
        <div v-if="loading" class="loading-message">
          Loading seat availability...
        </div>
        <div v-else class="seat-info">
          <div class="seat-legend">
            <div class="legend-item">
              <div class="seat available"></div>
              <span>Available</span>
            </div>
            <div class="legend-item">
              <div class="seat selected"></div>
              <span>Selected</span>
            </div>
            <div class="legend-item">
              <div class="seat reserved"></div>
              <span>Reserved</span>
            </div>
          </div>
          <div class="seat-limit-info">
            <p>Selected: <strong>{{ selectedCount }}</strong> / {{ MAX_SEATS }} seats</p>
            <p v-if="remainingSeats > 0" class="remaining">You can select {{ remainingSeats }} more seats</p>
            <p v-else-if="selectedCount === MAX_SEATS" class="max-reached">Maximum seats reached</p>
          </div>
        </div>
        <div class="seat-row" v-for="row in seatRows" :key="row.letter">
          <div class="row-label">{{ row.letter }}</div>
          <button
            v-for="seat in row.seats"
            :key="seat"
            :class="['seat', seatStatus(seat)]"
            @click="toggleSeat(seat)"
            :disabled="isSeatReserved(seat) || loading"
          >
            {{ seat }}
          </button>
        </div>
      </div>

      <div class="booking-actions">
        <div class="selected-info">
          Selected seats: <strong>{{ selectedSeats.join(', ') || 'None' }}</strong>
          <span class="seat-count">({{ selectedCount }}/{{ MAX_SEATS }})</span>
        </div>
        <button class="primary-btn" @click="confirmBooking" :disabled="selectedSeats.length === 0 || loading">
          <span v-if="loading">Reserving...</span>
          <span v-else>Confirm Booking</span>
        </button>
      </div>

      <div v-if="message" class="message" :class="{ success: success, error: !success }">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const registration = ref(null)
const selectedSeats = ref([])
const reservedSeats = ref([])
const message = ref('')
const success = ref(false)
const loading = ref(false)

// Generate seat map with 16 rows (A-P) and 20 seats per row
const seatRows = Array.from({ length: 16 }, (_, rowIndex) => {
  // Convert row index to letter (0->A, 1->B, etc.)
  const letter = String.fromCharCode('A'.charCodeAt(0) + rowIndex)
  // Create object with row letter and array of seat numbers
  return {
    letter,
    // Generate 20 seats for this row (A1-A20, B1-B20, etc.)
    seats: Array.from({ length: 20 }, (_, seatIndex) => `${letter}${seatIndex + 1}`)
  }
})

// Maximum seats per booking
const MAX_SEATS = 20

// Lifecycle hook - Load registration data and fetch reserved seats
onMounted(async () => {
  // Retrieve registration data from localStorage
  const saved = localStorage.getItem('cinemaRegistration')
  // Parse saved data or set to null if not found
  registration.value = saved ? JSON.parse(saved) : null

  // If registration exists with a movie selection, fetch already reserved seats
  if (registration.value && registration.value.movie) {
    await fetchReservedSeats()
  }
})

// Function to fetch already reserved seats for the selected movie and session
const fetchReservedSeats = async () => {
  try {
    // Set loading state while fetching data
    loading.value = true
    // Fetch all movies to find ID for current movie
    const allMovies = await axios.get('http://localhost:3001/api/movies')
    // Find movie object by matching title from registration
    const movie = allMovies.data.find(m => m.title === registration.value.movie)

    // If movie found and session selected, fetch reserved seats for that combination
    if (movie && registration.value.session) {
      // Request reserved seats with movie ID and session time as parameters
      const response = await axios.get(`http://localhost:3001/api/reserved-seats/${movie.id}?session=${registration.value.session.time}`)
      // Store reserved seats from response
      reservedSeats.value = response.data
    }
  } catch (error) {
    // Log error if API request fails
    console.error('Error fetching reserved seats:', error)
    // Use fallback test data if API fails
    reservedSeats.value = ['A1', 'A2', 'B3', 'C5']
  } finally {
    // Turn off loading state regardless of success/failure
    loading.value = false
  }
}

// Function to determine the visual status of a seat (reserved/selected/available)
const seatStatus = (seat) => {
  // Check if seat is already reserved by someone else
  if (isSeatReserved(seat)) return 'reserved'
  // Check if current user has selected this seat
  if (selectedSeats.value.includes(seat)) return 'selected'
  // Otherwise seat is available for booking
  return 'available'
}

// Function to check if a specific seat is already reserved
const isSeatReserved = (seat) => reservedSeats.value.includes(seat)

// Function to toggle seat selection when user clicks on a seat
const toggleSeat = (seat) => {
  // Do nothing if seat is already reserved by someone
  if (isSeatReserved(seat)) return

  // Find if this seat is already in the selection
  const index = selectedSeats.value.indexOf(seat)
  // If seat is not selected, add it to selection
  if (index === -1) {
    // Check if user has reached maximum seats allowed per booking
    if (selectedSeats.value.length >= MAX_SEATS) {
      // Show error message and prevent selection
      message.value = `Maximum ${MAX_SEATS} seats allowed per booking`
      success.value = false
      return
    }
    // Add seat to selected array
    selectedSeats.value.push(seat)
  } else {
    // If seat is already selected, remove it from selection
    selectedSeats.value.splice(index, 1)
  }
  // Clear any previous messages when toggling seats
  message.value = ''
}

// Function to submit and confirm seat booking
const confirmBooking = async () => {
  // Validation: Check that at least one seat is selected
  if (selectedSeats.value.length === 0) {
    success.value = false
    message.value = 'Please select at least one seat.'
    return
  }

  // Validation: Check that seats don't exceed maximum allowed
  if (selectedSeats.value.length > MAX_SEATS) {
    success.value = false
    message.value = `Maximum ${MAX_SEATS} seats allowed per booking`
    return
  }

  try {
    // Set loading state while processing booking
    loading.value = true

    // Fetch all movies to get the movie ID for API request
    const allMovies = await axios.get('http://localhost:3001/api/movies')
    // Find the currently selected movie in the list
    const movie = allMovies.data.find(m => m.title === registration.value.movie)

    // If movie not found, throw error and stop booking
    if (!movie) {
      throw new Error('Movie not found')
    }

    // Prepare booking data to send to backend API
    const reservationData = {
      movieId: movie.id, // Database ID of the movie
      sessionTime: registration.value.session.time, // Selected session time
      clientEmail: registration.value.email, // Customer email
      clientName: registration.value.name, // Customer name
      clientPhone: registration.value.phone || null, // Customer phone (optional)
      seats: selectedSeats.value // Array of selected seat IDs
    }

    // Send booking request to backend API
    const response = await axios.post('http://localhost:3001/api/reserve-seats', reservationData)

    // Check if booking was successful
    if (response.data.success) {
      // Update local reserved seats list to include newly booked seats
      reservedSeats.value = [...reservedSeats.value, ...selectedSeats.value]

      // Save booking data to localStorage for confirmation page access
      localStorage.setItem('cinemaBooking', JSON.stringify({
        user: registration.value, // Customer information
        seats: selectedSeats.value, // Booked seat IDs
        movie: registration.value.movie, // Movie title
        session: registration.value.session, // Session details
        timestamp: new Date().toISOString(), // Booking timestamp
        bookingId: response.data.bookingId // Unique booking ID from backend
      }))

      // Set success state and display booking confirmation message
      success.value = true
      message.value = `✅ Seats reserved successfully! Booking ID: ${response.data.bookingId}`

      // Navigate to booking confirmation page after 2 second delay
      setTimeout(() => {
        router.push('/booking-confirmation')
      }, 2000)
    } else {
      throw new Error(response.data.error || 'Failed to reserve seats')
    }

  } catch (error) {
    success.value = false
    message.value = `❌ Failed to reserve seats: ${error.response?.data?.error || error.message}`
  } finally {
    loading.value = false
  }
}

// Function to navigate back to registration page
const goToRegister = () => {
  router.push('/register')
}

// Computed property: Count of currently selected seats
const selectedCount = computed(() => selectedSeats.value.length)
// Computed property: Number of seats remaining to reach maximum limit
const remainingSeats = computed(() => MAX_SEATS - selectedCount.value)
</script>

<style scoped>
.container {
  max-width: 820px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.page-title {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.info-card,
.booking-card {
  background: #111;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 2rem;
}

.info-card p {
  color: var(--text-color);
  margin-bottom: 1rem;
}

.secondary-btn,
.primary-btn {
  border: none;
  border-radius: 8px;
  padding: 0.85rem 1.4rem;
  cursor: pointer;
  font-weight: 600;
}

.secondary-btn {
  background: #444;
  color: white;
}

.secondary-btn:hover {
  background: #555;
}

.user-summary {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
  color: var(--text-color);
}

.seat-map {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.seat-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(0, 212, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(0, 212, 255, 0.2);
}

.seat-legend {
  display: flex;
  gap: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-color);
}

.legend-item .seat {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #444;
}

.legend-item .seat.available {
  background: #1b1b1b;
}

.legend-item .seat.selected {
  background: #00d4ff;
  border-color: #00d4ff;
}

.legend-item .seat.reserved {
  background: #ff4444;
  border-color: #ff4444;
}

.seat-limit-info {
  text-align: right;
  font-size: 0.9rem;
}

.seat-limit-info p {
  margin: 0.25rem 0;
}

.remaining {
  color: #00d4ff;
  font-weight: 500;
}

.max-reached {
  color: #ffaa00;
  font-weight: 600;
}

.loading-message {
  text-align: center;
  padding: 2rem;
  color: var(--text-color);
  font-style: italic;
}

.seat-row {
  display: grid;
  grid-template-columns: auto repeat(20, minmax(28px, 1fr));
  gap: 0.5rem;
  align-items: center;
}

.row-label {
  color: #999;
  font-weight: 700;
}

.seat {
  padding: 0.8rem 0;
  border-radius: 10px;
  border: 1px solid #444;
  color: #eee;
  background: #1b1b1b;
  cursor: pointer;
  transition: transform 0.1s ease;
  font-size: 0.8rem;
  font-weight: 600;
}

.seat:hover:not(.reserved):not(:disabled) {
  transform: translateY(-1px);
}

.seat.available:hover {
  border-color: #00d4ff;
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.2);
}

.seat.selected {
  background: #00d4ff;
  color: #000;
  border-color: #00d4ff;
  box-shadow: 0 2px 8px rgba(0, 212, 255, 0.4);
}

.seat.reserved {
  background: #ff4444;
  color: #fff;
  border-color: #ff4444;
  cursor: not-allowed;
  opacity: 0.7;
}

.seat:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.booking-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.selected-info {
  text-align: center;
  color: var(--text-color);
  font-size: 1rem;
}

.seat-count {
  color: #00d4ff;
  font-weight: 600;
}

.primary-btn {
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  background: #00d4ff;
  color: #000;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
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
  transform: none;
  box-shadow: none;
}

.message {
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 600;
  margin-top: 1rem;
}

.message.success {
  background: rgba(0, 255, 0, 0.1);
  border: 1px solid #00ff00;
  color: #00ff00;
}

.message.error {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid #ff0000;
  color: #ff0000;
}

.seat.available {
  background: #1b1b1b;
}

.seat.selected {
  background: #0f5dff;
  border-color: #0a4fcc;
}

.seat.reserved {
  background: #7d3d3d;
  border-color: #9c4f4f;
  cursor: not-allowed;
}

.booking-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.selected-info {
  color: var(--text-color);
}

.primary-btn {
  background: var(--primary-color);
  color: white;
}

.primary-btn:hover {
  background: #b20710;
}

.message {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 10px;
  font-weight: 600;
}

.message.success {
  background: #15331a;
  color: #9cf09c;
}

.message.error {
  background: #3b1b1b;
  color: #f08e8e;
}

@media (max-width: 720px) {
  .seat-row {
    grid-template-columns: 1fr repeat(8, minmax(40px, 1fr));
  }
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.back-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background: #b20710;
}

.page-title {
  color: var(--primary-color);
  margin: 0;
}
</style>
