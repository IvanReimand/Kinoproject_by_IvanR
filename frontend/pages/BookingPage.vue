<template>
  <div class="container">
    <h2 class="page-title">🎟️ Book Your Seats</h2>

    <div v-if="!registration" class="info-card">
      <p>Please complete registration first before booking seats.</p>
      <button class="secondary-btn" @click="goToRegister">Go to Registration</button>
    </div>

    <div v-else class="booking-card">
      <div class="user-summary">
        <div><strong>Name:</strong> {{ registration.name }}</div>
        <div><strong>Email:</strong> {{ registration.email }}</div>
        <div><strong>Movie:</strong> {{ registration.movie }}</div>
      </div>

      <div class="seat-map">
        <div class="seat-row" v-for="row in seatRows" :key="row.letter">
          <div class="row-label">{{ row.letter }}</div>
          <button
            v-for="seat in row.seats"
            :key="seat"
            :class="['seat', seatStatus(seat)]"
            @click="toggleSeat(seat)"
            :disabled="isSeatReserved(seat)"
          >
            {{ seat }}
          </button>
        </div>
      </div>

      <div class="booking-actions">
        <div class="selected-info">
          Selected seats: <strong>{{ selectedSeats.join(', ') || 'None' }}</strong>
        </div>
        <button class="primary-btn" @click="confirmBooking" :disabled="selectedSeats.length === 0">
          Confirm Booking
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

const router = useRouter()
const registration = ref(null)
const selectedSeats = ref([])
const message = ref('')
const success = ref(false)

const seatRows = Array.from({ length: 16 }, (_, rowIndex) => {
  const letter = String.fromCharCode('A'.charCodeAt(0) + rowIndex)
  return {
    letter,
    seats: Array.from({ length: 20 }, (_, seatIndex) => `${letter}${seatIndex + 1}`)
  }
})

const reservedSeats = ref(['A1', 'A2', 'B3', 'C5'])

onMounted(() => {
  const saved = localStorage.getItem('cinemaRegistration')
  registration.value = saved ? JSON.parse(saved) : null
})

const seatStatus = (seat) => {
  if (isSeatReserved(seat)) return 'reserved'
  if (selectedSeats.value.includes(seat)) return 'selected'
  return 'available'
}

const isSeatReserved = (seat) => reservedSeats.value.includes(seat)

const toggleSeat = (seat) => {
  if (isSeatReserved(seat)) return
  const index = selectedSeats.value.indexOf(seat)
  if (index === -1) {
    selectedSeats.value.push(seat)
  } else {
    selectedSeats.value.splice(index, 1)
  }
}

const confirmBooking = () => {
  if (selectedSeats.value.length === 0) {
    success.value = false
    message.value = 'Please select at least one seat.'
    return
  }

  reservedSeats.value = [...reservedSeats.value, ...selectedSeats.value]
  localStorage.setItem('cinemaBooking', JSON.stringify({
    user: registration.value,
    seats: selectedSeats.value,
    movie: registration.value.movie,
    timestamp: new Date().toISOString()
  }))

  success.value = true
  message.value = `Booked seats: ${selectedSeats.value.join(', ')} - enjoy the movie!`
  selectedSeats.value = []
}

const goToRegister = () => {
  router.push('/register')
}
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
}

.seat:hover:not(.reserved) {
  transform: translateY(-1px);
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
</style>
