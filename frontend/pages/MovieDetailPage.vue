<!--
  MovieDetailPage.vue - Displays detailed information about a single movie
  Features:
  - Shows full movie details (title, duration, genre, rating, year, country)
  - Movie poster/image display
  - Registration link to book tickets for the movie
  - Back navigation to movie list
-->
<template>
  <div class="container">
    <!-- Loading state while fetching movie data -->
    <div v-if="loading" class="loading">Loading movie details...</div>
    <!-- Error message display if data fetch fails -->
    <div v-else-if="error" class="error">{{ error }}</div>
    <!-- Main movie detail content -->
    <div v-else>
      <div class="movie-detail-page">
        <!-- Movie poster image section -->
        <div class="movie-detail-avatar">
          <!-- Display movie image if available, otherwise show emoji -->
          <img
            v-if="movie.image"
            :src="`/images/${movie.image}`"
            :alt="movie.title"
            class="movie-poster-img"
          />
          <div v-else class="movie-poster-emoji">🎬</div>
        </div>
        <!-- Movie information and details section -->
        <div class="movie-detail-info">
          <!-- Movie title as main heading -->
          <h2 class="page-title">{{ movie.title }}</h2>
          <!-- Grid display of movie attributes -->
          <div class="movie-details-grid">
            <!-- Duration of the movie in minutes -->
            <div class="detail-item">
              <div class="detail-label">Duration</div>
              <div class="detail-value">{{ movie.duration_min }} minutes</div>
            </div>
            <!-- Movie genre/category -->
            <div class="detail-item">
              <div class="detail-label">Genre</div>
              <div class="detail-value">{{ movie.genre }}</div>
            </div>
            <!-- Movie rating on 0-10 scale -->
            <div class="detail-item">
              <div class="detail-label">Rating</div>
              <div class="detail-value"><span class="rating">⭐ {{ movie.rating }}</span></div>
            </div>
            <!-- Year the movie was released -->
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
          <!-- Action buttons for registration and navigation -->
          <div class="detail-actions">
            <!-- Link to registration page with movie ID as query parameter -->
            <router-link :to="{ path: '/register', query: { movieId: route.params.id } }" class="register-btn">
              Register for this movie
            </router-link>
            <!-- Back navigation link to movie list -->
            <router-link to="/" class="back-link">← Back to movies</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import Vue 3 composition API functions
import { ref, onMounted } from 'vue'
// Import Vue Router for accessing route parameters
import { useRoute } from 'vue-router'
// Import Axios for HTTP requests
import axios from 'axios'

// Get route object to access movie ID from URL parameters
const route = useRoute()
// Store the movie data fetched from API
const movie = ref(null)
// Track loading state to show/hide loading indicator
const loading = ref(true)
// Store error message if data fetch fails
const error = ref(null)

// Lifecycle hook - executes when component is mounted to DOM
onMounted(async () => {
  try {
    // Fetch movie details from API using movie ID from route params
    const response = await axios.get(`/api/movies/${route.params.id}`)
    // Store fetched movie data in reactive variable
    movie.value = response.data
  } catch (err) {
    // Set error message if API request fails
    error.value = 'Failed to load movie details.'
    // Log error to browser console for debugging
    console.error(err)
  } finally {
    // Turn off loading indicator regardless of success/failure
    loading.value = false
  }
})
</script>

<style scoped>
.movie-detail-page {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 2rem;
  align-items: start;
}

.movie-detail-avatar {
  width: 240px;
  height: 240px;
  border-radius: 24px;
  background: linear-gradient(135deg, #e50914 0%, #ff7f50 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  overflow: hidden;
}

.movie-poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.movie-poster-emoji {
  font-size: 4rem;
}

.movie-detail-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.movie-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.detail-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.register-btn,
.back-link {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
}

.register-btn {
  background: var(--primary-color);
  color: white;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
}

.register-btn:hover,
.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .movie-detail-page {
    grid-template-columns: 1fr;
  }
}
</style>
