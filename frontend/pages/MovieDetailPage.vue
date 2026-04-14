<template>
  <div class="container">
    <div v-if="loading" class="loading">Loading movie details...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="movie-detail-page">
        <div class="movie-detail-avatar">
          <img
            v-if="movie.image"
            :src="`/images/${movie.image}`"
            :alt="movie.title"
            class="movie-poster-img"
          />
          <div v-else class="movie-poster-emoji">🎬</div>
        </div>
        <div class="movie-detail-info">
          <h2 class="page-title">{{ movie.title }}</h2>
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
              <div class="detail-value"><span class="rating">⭐ {{ movie.rating }}</span></div>
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
          <router-link to="/" class="back-link">← Back to movies</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const movie = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const response = await axios.get(`/api/movies/${route.params.id}`)
    movie.value = response.data
  } catch (err) {
    error.value = 'Failed to load movie details.'
    console.error(err)
  } finally {
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

.back-link {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .movie-detail-page {
    grid-template-columns: 1fr;
  }
}
</style>
