<template>
  <div class="container">
    <div class="page-header">
      <button @click="$router.go(-1)" class="back-btn">← Back</button>
      <h2 class="page-title">🎥 Movies - Grid View</h2>
    </div>

    <div v-if="loading" class="loading">Loading movies...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="movies-grid">
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
import { ref, onMounted } from 'vue'
import axios from 'axios'
import MovieCard from '../components/MovieCard.vue'

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
