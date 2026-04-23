<template>
  <div class="container">
    <div class="page-header">
      <button @click="$router.go(-1)" class="back-btn">← Back</button>
      <h2 class="page-title">📝 Registration</h2>
    </div>

    <div class="registration-form">
      <form @submit.prevent="submitRegistration" class="form-card">
        <div class="form-group">
          <label for="name">Name</label>
          <input id="name" v-model="user.name" type="text" required placeholder="Your full name" />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="user.email" type="email" required placeholder="you@example.com" />
        </div>

        <div class="form-group">
          <label for="phone">Phone</label>
          <input id="phone" v-model="user.phone" type="tel" required placeholder="+372 555 123 4567" />
        </div>

        <!-- Movie selection dropdown or display -->
        <div class="form-group">
          <label for="movie">Movie</label>
          <!-- If movie was pre-selected from detail page, show it as text -->
          <template v-if="selectedMovie">
            <div class="selected-movie">
              {{ selectedMovie.title }} ({{ selectedMovie.release_year }})
            </div>
          </template>
          <!-- Otherwise show dropdown to select movie -->
          <template v-else>
            <!-- Dropdown to select movie from available list -->
            <select id="movie" v-model="user.movie" required>
              <!-- Disabled placeholder option -->
              <option value="" disabled>Select a movie</option>
              <!-- Loop through all movies to populate dropdown options -->
              <option v-for="movie in movies" :key="movie.id" :value="movie.title">
                {{ movie.title }} ({{ movie.release_year }})
              </option>
            </select>
          </template>
        </div>

        <div class="form-actions">
          <button type="submit" class="primary-btn">Continue to Session Selection</button>
        </div>
      </form>

      <div v-if="message" class="message" :class="{ success: success, error: !success }">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const message = ref('')
const success = ref(false)
const movies = ref([])
const selectedMovie = ref(null)

// Reactive object to hold user registration form data
const user = reactive({
  name: '', // User's full name
  email: '', // User's email address
  phone: '', // User's phone number
  movie: '' // Selected movie title
})

// Lifecycle hook - Load movies and check for pre-selected movie from route query
onMounted(async () => {
  try {
    // Fetch all movies from backend API for dropdown list
    const response = await axios.get('/api/movies')
    // Store movies in reactive variable
    movies.value = response.data

    // Check if user came from movie detail page (movieId in URL query params)
    const movieId = route.query.movieId
    // If movieId exists, find and pre-select that movie
    if (movieId) {
      // Find movie with matching ID in the movies array
      selectedMovie.value = movies.value.find((movie) => String(movie.id) === String(movieId)) || null
      // If movie found, set it as the selected movie in form
      if (selectedMovie.value) {
        user.movie = selectedMovie.value.title
      }
    }
  } catch (error) {
    // Log error if API request fails
    console.error('Failed to load movies for registration:', error)
  }
})

// Function to handle form submission and validate registration data
const submitRegistration = () => {
  // Check if all required fields are filled before proceeding
  if (!user.name || !user.email || !user.phone || !user.movie) {
    // Set error state and message if validation fails
    success.value = false
    message.value = 'Please fill in all registration fields.'
    return
  }

  // Save registration data to localStorage for use in booking process
  localStorage.setItem('cinemaRegistration', JSON.stringify(user))
  // Set success state and display confirmation message
  success.value = true
  message.value = 'Registration complete! Redirecting to session selection...'

  // Navigate to session selection page after 1.2 seconds
  setTimeout(() => {
    router.push('/session-selection')
  }, 1200)
}
</script>

<style scoped>
.container {
  max-width: 700px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.page-title {
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.registration-form {
  background: #111;
  padding: 2rem;
  border: 1px solid var(--border-color);
  border-radius: 10px;
}

.form-card {
  display: grid;
  gap: 1.25rem;
}

.form-group {
  display: grid;
  gap: 0.5rem;
}

label {
  color: var(--text-color);
  font-weight: 600;
}

input,
select {
  width: 100%;
  padding: 0.85rem;
  border-radius: 8px;
  background: #222;
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.primary-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.9rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.primary-btn:hover {
  background: #b20710;
}

.message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 500;
}

.message.success {
  background: #1b3b1b;
  color: #8ef08e;
}

.message.error {
  background: #3b1b1b;
  color: #f08e8e;
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
