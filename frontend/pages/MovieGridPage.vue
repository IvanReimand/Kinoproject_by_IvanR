<template>
  <div class="container">
    <h2 class="page-title">🎥 Movies - Grid View</h2>
    
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
</style>
