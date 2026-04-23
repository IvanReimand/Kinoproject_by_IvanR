<!--
  MovieListPage.vue - Displays all movies in a vertical list format
  Features:
  - Lists all available movies with key details
  - Each movie shows poster, title, duration, genre, rating, year, country
  - Click movie to view detailed information
  - Back navigation button
-->
<template>
  <div class="container">
    <!-- Header with back button and title -->
    <div class="page-header">
      <!-- Back button to navigate to previous page -->
      <button @click="$router.go(-1)" class="back-btn">← Back</button>
      <!-- Page title indicating list view format -->
      <h2 class="page-title">📽️ Movies - List View</h2>
    </div>

    <!-- Loading state while fetching movies from API -->
    <div v-if="loading" class="loading">Loading movies...</div>
    <!-- Error message display if API request fails -->
    <div v-else-if="error" class="error">{{ error }}</div>
    <!-- Main movie list content -->
    <div v-else>
      <!-- Container for vertically stacked movie items -->
      <div class="movie-list">
        <!-- Loop through all movies and create clickable item for each -->
        <router-link
          v-for="movie in movies"
          :key="movie.id"
          :to="`/movie/${movie.id}`"
          class="movie-item-link"
        >
          <!-- Individual movie item container -->
          <div class="movie-item">
            <!-- Movie poster image section -->
            <div class="movie-poster-small">
              <!-- Display poster if available, otherwise show placeholder emoji -->
              <img
                v-if="movie.image"
                :src="`/images/${movie.image}`"
                :alt="movie.title"
                class="movie-poster-img"
              />
              <div v-else class="movie-poster-emoji">🎬</div>
            </div>
            <!-- Movie information content section -->
            <div class="movie-content">
              <!-- Movie title as main heading -->
              <div class="movie-content-title">{{ movie.title }}</div>
              <!-- Grid of movie attributes -->
              <div class="movie-details-grid">
                <!-- Movie duration in minutes -->
                <div class="detail-item">
                  <div class="detail-label">Duration</div>
                  <div class="detail-value">{{ movie.duration_min }} minutes</div>
                </div>
                <!-- Movie genre/type -->
                <div class="detail-item">
                  <div class="detail-label">Genre</div>
                  <div class="detail-value">{{ movie.genre }}</div>
                </div>
                <!-- Movie rating with star icon -->
                <div class="detail-item">
                  <div class="detail-label">Rating</div>
                  <div class="detail-value">
                    <span class="rating">⭐ {{ movie.rating }}</span>
                  </div>
                </div>
                <!-- Year movie was released -->
                <div class="detail-item">
                  <div class="detail-label">Release Year</div>
                  <div class="detail-value">{{ movie.release_year }}</div>
                </div>
                <!-- Country of movie origin -->
                <div class="detail-item">
                  <div class="detail-label">Country</div>
                  <div class="detail-value">{{ movie.country }}</div>
                </div>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import Vue 3 composition API functions
import { ref, onMounted } from 'vue'
// Import Axios for HTTP requests
import axios from 'axios'

// Store array of all movies fetched from API
const movies = ref([])
// Track loading state to show/hide loading indicator
const loading = ref(true)
// Store error message if API request fails
const error = ref(null)

// Lifecycle hook - executes when component is mounted to DOM
onMounted(async () => {
  try {
    // Fetch all movies from backend API
    const response = await axios.get('/api/movies')
    // Store fetched movies in reactive variable
    movies.value = response.data
  } catch (err) {
    // Set error message if backend is unreachable or request fails
    error.value = 'Failed to load movies. Make sure the backend server is running.'
    // Log error to browser console for debugging
    console.error(err)
  } finally {
    // Turn off loading indicator regardless of success/failure
    loading.value = false
  }
})
</script>

<style scoped>
.movie-poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-poster-emoji {
  font-size: 2.5rem;
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
