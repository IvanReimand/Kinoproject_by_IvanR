<!--
  AdminPage.vue - Admin panel for managing movies in the cinema web app
  Features:
  - Add new movies to the database
  - View all movies with management options
  - Delete movies (only those added via admin, not original movies)
-->
<template>
  <!-- Main container for the entire admin page -->
  <div class="container">
    <!-- Page header with cinema emoji -->
    <h2 class="page-title">🎬 Admin Panel - Add New Film</h2>

    <!-- Form section for adding new movies -->
    <div class="admin-form">
      <!-- Movie addition form with Vue.js submit prevention -->
      <form @submit.prevent="addMovie" class="movie-form">
        <!-- Movie title input field -->
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

        <!-- Two-column row for duration and genre -->
        <div class="form-row">
          <!-- Movie duration input (in minutes) -->
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

          <!-- Movie genre input -->
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

        <!-- Two-column row for rating and release year -->
        <div class="form-row">
          <!-- Movie rating input (0-10 scale) -->
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

          <!-- Movie release year input -->
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

        <!-- Movie country input -->
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

        <!-- Optional movie image filename input -->
        <div class="form-group">
          <label for="image">Image filename (optional):</label>
          <input
            id="image"
            v-model="newMovie.image"
            type="text"
            placeholder="movie-poster.jpg"
          />
          <!-- Hint for users about image upload location -->
          <small class="form-hint">Upload image to frontend/public/images/ folder first</small>
        </div>

        <!-- Form action buttons -->
        <div class="form-actions">
          <!-- Submit button with loading state -->
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Adding...' : 'Add Movie' }}
          </button>
          <!-- Cancel button that navigates back to home -->
          <router-link to="/" class="cancel-btn">Cancel</router-link>
        </div>
      </form>

      <!-- Success/error message display -->
      <div v-if="message" class="message" :class="{ success: success, error: !success }">
        {{ message }}
      </div>
    </div>

    <!-- Movie Management Section - shows all movies with delete options -->
    <div class="movie-management">
      <!-- Section header -->
      <h3 class="section-title">🎭 Manage Added Films</h3>
      <!-- Explanation of delete restrictions -->
      <p class="section-description">You can only delete films that were added through this admin panel (ID > 10). Original films cannot be deleted.</p>

      <!-- Loading state for movie list -->
      <div v-if="movies.length === 0" class="no-movies">
        Loading movies...
      </div>

      <!-- Movie list with management options -->
      <div v-else class="movies-list">
        <!-- Loop through all movies -->
        <div
          v-for="movie in movies"
          :key="movie.id"
          class="movie-item"
          :class="{ 'original-movie': movie.id <= 10 }"
        >
          <!-- Movie information display -->
          <div class="movie-info">
            <!-- Movie title -->
            <div class="movie-title">{{ movie.title }}</div>
            <!-- Movie details (year, genre, country) -->
            <div class="movie-details">
              {{ movie.release_year }} • {{ movie.genre }} • {{ movie.country }}
            </div>
          </div>

          <!-- Movie action buttons -->
          <div class="movie-actions">
            <!-- Delete button - only shown for movies with ID > 10 -->
            <button
              v-if="movie.id > 10"
              @click="deleteMovie(movie.id, movie.title)"
              class="delete-btn"
              :disabled="deleting === movie.id"
            >
              {{ deleting === movie.id ? 'Deleting...' : 'Delete' }}
            </button>
            <!-- Protected label for original movies -->
            <span v-else class="protected-label">Protected</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Vue 3 Composition API imports
import { ref, reactive, onMounted } from 'vue'
// Vue Router for navigation
import { useRouter } from 'vue-router'
// Axios for HTTP requests to backend API
import axios from 'axios'

// Vue Router instance for programmatic navigation
const router = useRouter()
// Loading state for add movie form
const loading = ref(false)
// Success/error message text
const message = ref('')
// Whether the last operation was successful
const success = ref(false)
// Array to store all movies for management
const movies = ref([])
// ID of movie currently being deleted (for loading state)
const deleting = ref(null)

// Reactive object for new movie form data
const newMovie = reactive({
  title: '',
  duration_min: null,
  genre: '',
  rating: null,
  release_year: null,
  country: '',
  image: null
})

// Lifecycle hook - runs when component is mounted
// Fetches all movies to display in management section
onMounted(async () => {
  await fetchMovies()
})

// Function to fetch all movies from backend API
const fetchMovies = async () => {
  try {
    // GET request to /api/movies endpoint
    const response = await axios.get('/api/movies')
    // Update movies array with response data
    movies.value = response.data
  } catch (error) {
    // Log error if fetching fails
    console.error('Error fetching movies:', error)
  }
}

// Function to add a new movie via form submission
const addMovie = async () => {
  // Set loading state to show spinner/button disabled
  loading.value = true
  // Clear any previous messages
  message.value = ''

  try {
    // POST request to add new movie
    const response = await axios.post('/api/movies', newMovie)
    // Set success state and message
    success.value = true
    message.value = `Movie "${response.data.title}" added successfully!`

    // Reset form fields to initial state
    Object.keys(newMovie).forEach(key => {
      newMovie[key] = key === 'image' ? null : (typeof newMovie[key] === 'number' ? null : '')
    })

    // Refresh movies list to show the new movie
    await fetchMovies()

    // Redirect to home page after 2 seconds
    setTimeout(() => {
      router.push('/')
    }, 2000)

  } catch (error) {
    // Set error state and message
    success.value = false
    message.value = error.response?.data?.error || 'Failed to add movie. Please try again.'
    console.error('Error adding movie:', error)
  } finally {
    // Always reset loading state
    loading.value = false
  }
}

// Function to delete a movie by ID
const deleteMovie = async (movieId, movieTitle) => {
  // Show confirmation dialog before deleting
  if (!confirm(`Are you sure you want to delete "${movieTitle}"?`)) {
    return
  }

  // Set deleting state for loading indicator
  deleting.value = movieId

  try {
    // DELETE request to remove movie
    await axios.delete(`/api/movies/${movieId}`)
    // Set success message
    success.value = true
    message.value = `Movie "${movieTitle}" deleted successfully!`

    // Refresh movies list to remove deleted movie
    await fetchMovies()

    // Clear message after 3 seconds
    setTimeout(() => {
      message.value = ''
      success.value = false
    }, 3000)

  } catch (error) {
    // Set error state and message
    success.value = false
    message.value = error.response?.data?.error || 'Failed to delete movie. Please try again.'
    console.error('Error deleting movie:', error)
  } finally {
    // Always reset deleting state
    deleting.value = null
  }
}
</script>

<style scoped>
/* Admin form container - centers the form and limits max width */
.admin-form {
  max-width: 600px;
  margin: 0 auto;
}

/* Movie form styling - dark background with border and padding */
.movie-form {
  background-color: #222222;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

/* Form group spacing - adds margin between form fields */
.form-group {
  margin-bottom: 1.5rem;
}

/* Form row layout - creates two-column grid for related fields */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Label styling - consistent appearance for all form labels */
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

/* Input field styling - dark theme input appearance */
input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: #333333;
  color: var(--text-color);
  font-size: 1rem;
}

/* Input focus state - highlights focused input with primary color */
input:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Form hint styling - smaller text for additional information */
.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #999999;
}

/* Form actions layout - horizontal button layout */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

/* Submit button styling - primary color with hover effects */
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

/* Submit button hover state - darker shade on hover */
.submit-btn:hover:not(:disabled) {
  background-color: #b20710;
}

/* Submit button disabled state - reduced opacity */
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Cancel button styling - link-like appearance with border */
.cancel-btn {
  color: var(--text-color);
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  transition: border-color 0.3s;
}

/* Cancel button hover state - highlights border */
.cancel-btn:hover {
  border-color: var(--primary-color);
}

/* Message styling - base styles for success/error messages */
.message {
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 4px;
  font-weight: 500;
}

/* Success message styling - green theme */
.message.success {
  background-color: #1a4d1a;
  border: 1px solid #2d7d2d;
  color: #90ee90;
}

/* Error message styling - red theme */
.message.error {
  background-color: #4d1a1a;
  border: 1px solid #7d2d2d;
  color: #ee9090;
}

/* Mobile responsive styles - stack form elements vertically on small screens */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}

/* ===== MOVIE MANAGEMENT STYLES ===== */

/* Movie management section container */
.movie-management {
  margin-top: 3rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

/* Section title styling */
.section-title {
  color: var(--text-color);
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

/* Section description styling */
.section-description {
  color: #999999;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* No movies state - shown when loading or no movies exist */
.no-movies {
  text-align: center;
  color: #999999;
  padding: 2rem;
  background-color: #222222;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

/* Movies list container - vertical flex layout */
.movies-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Individual movie item styling - horizontal layout with info and actions */
.movie-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #222222;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: border-color 0.3s;
}

/* Movie item hover effect - highlights border */
.movie-item:hover {
  border-color: var(--primary-color);
}

/* Original movie styling - reduced opacity to indicate protection */
.movie-item.original-movie {
  opacity: 0.7;
}

/* Movie information container - takes up available space */
.movie-info {
  flex: 1;
}

/* Movie title styling - prominent display */
.movie-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

/* Movie details styling - secondary information */
.movie-details {
  font-size: 0.9rem;
  color: #999999;
}

/* Movie actions container - right-aligned buttons/labels */
.movie-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Delete button styling - red theme for destructive action */
.delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.3s;
}

/* Delete button hover state - darker red */
.delete-btn:hover:not(:disabled) {
  background-color: #c82333;
}

/* Delete button disabled state - reduced opacity during deletion */
.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Protected label styling - yellow theme for protected movies */
.protected-label {
  color: #ffc107;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 193, 7, 0.1);
  border-radius: 4px;
  border: 1px solid #ffc107;
}
</style>