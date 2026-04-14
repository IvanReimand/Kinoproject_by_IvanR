<template>
  <div class="container">
    <h2 class="page-title">🎬 Admin Panel - Add New Film</h2>

    <div class="admin-form">
      <form @submit.prevent="addMovie" class="movie-form">
        <div class="form-group">
          <label for="title">Title:</label>
          <input
            id="title"
            v-model="newMovie.title"
            type="text"
            required
            placeholder="Enter movie title"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="duration">Duration (minutes):</label>
            <input
              id="duration"
              v-model.number="newMovie.duration_min"
              type="number"
              required
              min="1"
              placeholder="120"
            />
          </div>

          <div class="form-group">
            <label for="genre">Genre:</label>
            <input
              id="genre"
              v-model="newMovie.genre"
              type="text"
              required
              placeholder="action, comedy, drama..."
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="rating">Rating:</label>
            <input
              id="rating"
              v-model.number="newMovie.rating"
              type="number"
              step="0.1"
              min="0"
              max="10"
              required
              placeholder="8.5"
            />
          </div>

          <div class="form-group">
            <label for="year">Release Year:</label>
            <input
              id="year"
              v-model.number="newMovie.release_year"
              type="number"
              required
              min="1900"
              max="2030"
              placeholder="2023"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="country">Country:</label>
          <input
            id="country"
            v-model="newMovie.country"
            type="text"
            required
            placeholder="USA, Russia, Soviet Union..."
          />
        </div>

        <div class="form-group">
          <label for="image">Image filename (optional):</label>
          <input
            id="image"
            v-model="newMovie.image"
            type="text"
            placeholder="movie-poster.jpg"
          />
          <small class="form-hint">Upload image to frontend/public/images/ folder first</small>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Adding...' : 'Add Movie' }}
          </button>
          <router-link to="/" class="cancel-btn">Cancel</router-link>
        </div>
      </form>

      <div v-if="message" class="message" :class="{ success: success, error: !success }">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const loading = ref(false)
const message = ref('')
const success = ref(false)

const newMovie = reactive({
  title: '',
  duration_min: null,
  genre: '',
  rating: null,
  release_year: null,
  country: '',
  image: null
})

const addMovie = async () => {
  loading.value = true
  message.value = ''

  try {
    const response = await axios.post('/api/movies', newMovie)
    success.value = true
    message.value = `Movie "${response.data.title}" added successfully!`

    // Reset form
    Object.keys(newMovie).forEach(key => {
      newMovie[key] = key === 'image' ? null : (typeof newMovie[key] === 'number' ? null : '')
    })

    // Redirect after 2 seconds
    setTimeout(() => {
      router.push('/')
    }, 2000)

  } catch (error) {
    success.value = false
    message.value = error.response?.data?.error || 'Failed to add movie. Please try again.'
    console.error('Error adding movie:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-form {
  max-width: 600px;
  margin: 0 auto;
}

.movie-form {
  background-color: #222222;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: #333333;
  color: var(--text-color);
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #999999;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.submit-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #b20710;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  color: var(--text-color);
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  transition: border-color 0.3s;
}

.cancel-btn:hover {
  border-color: var(--primary-color);
}

.message {
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 4px;
  font-weight: 500;
}

.message.success {
  background-color: #1a4d1a;
  border: 1px solid #2d7d2d;
  color: #90ee90;
}

.message.error {
  background-color: #4d1a1a;
  border: 1px solid #7d2d2d;
  color: #ee9090;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>