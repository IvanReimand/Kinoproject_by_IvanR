<template>
  <div class="container">
    <h2 class="page-title">📽️ Movies - List View</h2>
    
    <div v-if="loading" class="loading">Loading movies...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="movie-list">
        <div v-for="movie in movies" :key="movie.id" class="movie-item">
          <div class="movie-poster-small">🎬</div>
          <div class="movie-content">
            <div class="movie-content-title">{{ movie.title }}</div>
            <div class="movie-details-grid">
              <div class="detail-item">
                <div class="detail-label">Duration</div>
                <div class="detail-value">{{ movie.duration_min }} minutes</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Genre</div>
                <div class="detail-value">{{ movie.genre }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Rating</div>
                <div class="detail-value">
                  <span class="rating">⭐ {{ movie.rating }}</span>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Release Year</div>
                <div class="detail-value">{{ movie.release_year }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Country</div>
                <div class="detail-value">{{ movie.country }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const movies = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const response = await axios.get('/api/movies')
    movies.value = response.data
  } catch (err) {
    error.value = 'Failed to load movies. Make sure the backend server is running.'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
</style>
