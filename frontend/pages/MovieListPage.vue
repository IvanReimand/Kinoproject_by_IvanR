<template>
  <div class="container">
    <div class="page-header">
      <button @click="$router.go(-1)" class="back-btn">← Back</button>
      <h2 class="page-title">📽️ Movies - List View</h2>
    </div>

    <div v-if="loading" class="loading">Loading movies...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="movie-list">
        <router-link
          v-for="movie in movies"
          :key="movie.id"
          :to="`/movie/${movie.id}`"
          class="movie-item-link"
        >
          <div class="movie-item">
            <div class="movie-poster-small">
              <img
                v-if="movie.image"
                :src="`/images/${movie.image}`"
                :alt="movie.title"
                class="movie-poster-img"
              />
              <div v-else class="movie-poster-emoji">🎬</div>
            </div>
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
        </router-link>
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
