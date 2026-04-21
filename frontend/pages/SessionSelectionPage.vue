<template>
  <div class="container">
    <div class="session-selection-card">
      <div class="header">
        <button @click="$router.go(-1)" class="back-btn">← Back</button>
        <h2 class="page-title">🎬 Select Your Session</h2>
        <p class="subtitle">Choose a time for your movie experience</p>
      </div>

      <div v-if="!registration" class="error-message">
        <p>Please complete registration first.</p>
        <button class="primary-btn" @click="$router.push('/register')">Go to Registration</button>
      </div>

      <div v-else>
        <!-- Movie Info -->
        <div class="movie-info">
          <h3>{{ registration.movie }}</h3>
          <div class="movie-details">
            <span class="detail">👤 {{ registration.name }}</span>
            <span class="detail">📧 {{ registration.email }}</span>
          </div>
        </div>

        <!-- Session Selection -->
        <div class="sessions-grid">
          <div
            v-for="session in sessions"
            :key="session.time"
            :class="['session-card', { 'selected': selectedSession?.time === session.time }]"
            @click="selectSession(session)"
          >
            <div class="session-time">
              <h3>{{ session.time }}</h3>
              <span class="period">{{ session.period }}</span>
            </div>
            <div class="session-info">
              <div class="info-item">
                <span class="label">Duration:</span>
                <span class="value">{{ session.duration }}</span>
              </div>
              <div class="info-item">
                <span class="label">Hall:</span>
                <span class="value">{{ session.hall }}</span>
              </div>
              <div class="info-item">
                <span class="label">Price:</span>
                <span class="value">{{ session.price }}</span>
              </div>
            </div>
            <div class="session-features">
              <span class="feature">🎥 4K Projection</span>
              <span class="feature">🔊 Dolby Atmos</span>
              <span class="feature">💺 Premium Seats</span>
            </div>
          </div>
        </div>

        <!-- Selected Session Summary -->
        <div v-if="selectedSession" class="selected-summary">
          <h3>Selected Session</h3>
          <div class="summary-card">
            <div class="summary-time">
              <h4>{{ selectedSession.time }}</h4>
              <span>{{ selectedSession.period }}</span>
            </div>
            <div class="summary-details">
              <p><strong>Hall:</strong> {{ selectedSession.hall }}</p>
              <p><strong>Duration:</strong> {{ selectedSession.duration }}</p>
              <p><strong>Price per seat:</strong> {{ selectedSession.price }}</p>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="action-section">
          <button
            class="primary-btn proceed-btn"
            @click="proceedToBooking"
            :disabled="!selectedSession"
          >
            Continue to Seat Selection
          </button>
          <p v-if="!selectedSession" class="select-prompt">
            Please select a session to continue
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const registration = ref(null)
const selectedSession = ref(null)

// Available sessions
const sessions = ref([
  {
    time: '12:00',
    period: 'Afternoon',
    duration: '2h 15min',
    hall: 'Hall 1',
    price: '€12',
    features: ['4K', 'Dolby Atmos', 'Premium Seats']
  },
  {
    time: '16:00',
    period: 'Evening',
    duration: '2h 15min',
    hall: 'Hall 2',
    price: '€14',
    features: ['4K', 'Dolby Atmos', 'VIP Lounge']
  },
  {
    time: '20:00',
    period: 'Night',
    duration: '2h 15min',
    hall: 'Hall 1',
    price: '€16',
    features: ['4K', 'Dolby Atmos', 'Premium Seats']
  }
])

onMounted(() => {
  const saved = localStorage.getItem('cinemaRegistration')
  if (saved) {
    registration.value = JSON.parse(saved)
  } else {
    router.push('/register')
  }
})

const selectSession = (session) => {
  selectedSession.value = session
}

const proceedToBooking = () => {
  if (!selectedSession.value) return

  // Save session selection to localStorage
  const sessionData = {
    ...registration.value,
    session: selectedSession.value
  }
  localStorage.setItem('cinemaRegistration', JSON.stringify(sessionData))

  // Navigate to booking page
  router.push('/booking')
}
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.session-selection-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solid #00d4ff;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 212, 255, 0.1);
}

.header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #00d4ff;
}

.back-btn {
  position: absolute;
  left: 2.5rem;
  top: 2.5rem;
  background: #444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.back-btn:hover {
  background: #555;
}

.page-title {
  color: #00d4ff;
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #aaa;
  margin: 0;
  font-size: 1rem;
}

.movie-info {
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.movie-info h3 {
  color: #00d4ff;
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.movie-details {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.detail {
  color: #fff;
  font-size: 0.9rem;
}

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.session-card {
  background: #1a1a1a;
  border: 2px solid #444;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.session-card:hover {
  border-color: #00d4ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 212, 255, 0.2);
}

.session-card.selected {
  border-color: #00d4ff;
  background: rgba(0, 212, 255, 0.05);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
}

.session-card.selected::after {
  content: '✓';
  position: absolute;
  top: 10px;
  right: 10px;
  background: #00d4ff;
  color: #000;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.session-time {
  text-align: center;
  margin-bottom: 1rem;
}

.session-time h3 {
  color: #00d4ff;
  font-size: 1.8rem;
  margin: 0 0 0.25rem 0;
}

.session-time .period {
  color: #aaa;
  font-size: 0.9rem;
  font-style: italic;
}

.session-info {
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.label {
  color: #aaa;
  font-weight: 500;
}

.value {
  color: #fff;
  font-weight: 600;
}

.session-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature {
  background: rgba(0, 212, 255, 0.1);
  color: #00d4ff;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.selected-summary {
  background: rgba(0, 255, 0, 0.05);
  border: 1px solid #00ff00;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.selected-summary h3 {
  color: #00ff00;
  margin: 0 0 1rem 0;
  text-align: center;
}

.summary-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.summary-time {
  text-align: center;
}

.summary-time h4 {
  color: #00ff00;
  font-size: 1.5rem;
  margin: 0 0 0.25rem 0;
}

.summary-time span {
  color: #aaa;
  font-size: 0.9rem;
}

.summary-details p {
  margin: 0.25rem 0;
  color: #fff;
}

.action-section {
  text-align: center;
}

.primary-btn {
  background: #00d4ff;
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
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

.select-prompt {
  color: #ffaa00;
  font-style: italic;
  margin: 0;
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

@media (max-width: 768px) {
  .container {
    margin: 1rem auto;
    padding: 0 0.5rem;
  }

  .session-selection-card {
    padding: 1.5rem;
  }

  .back-btn {
    position: static;
    margin-bottom: 1rem;
  }

  .sessions-grid {
    grid-template-columns: 1fr;
  }

  .summary-card {
    flex-direction: column;
    text-align: center;
  }

  .movie-details {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
