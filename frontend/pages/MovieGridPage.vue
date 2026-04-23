<!--
  MovieGridPage.vue - Displays all movies in a responsive grid layout
  Features:
  - Grid view of all available movies
  - Uses MovieCard component for each movie display
  - Responsive grid that adapts to screen size
  - Back navigation button
-->
<template>
  <div class="container">
    <!-- Header with back button and page title -->
    <div class="page-header">
      <!-- Back button to navigate to previous page -->
      <button @click="$router.go(-1)" class="back-btn">← Back</button>
      <!-- Page title indicating grid view format -->
      <h2 class="page-title">🎥 Movies - Grid View</h2>
    </div>

    <!-- Loading state while fetching movies from API -->
    <div v-if="loading" class="loading">Loading movies...</div>
    <!-- Error message display if API request fails -->
    <div v-else-if="error" class="error">{{ error }}</div>
    <!-- Main grid content -->
    <div v-else>
      <!-- Responsive grid container for movie cards -->
      <div class="movies-grid">
        <!-- Loop through all movies and render MovieCard component for each -->
        <MovieCard
          v-for="movie in movies"
          :key="movie.id"
          :movie="movie"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
// Import Vue 3 composition API functions
import { ref, onMounted } from 'vue'
// Import Axios for HTTP requests
import axios from 'axios'
// Import MovieCard component to display individual movies
import MovieCard from '../components/MovieCard.vue'

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
