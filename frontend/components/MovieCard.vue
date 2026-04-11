<template>
  <div class="movie-card">
    <div class="movie-poster">🎬</div>
    <div class="movie-info">
      <div class="movie-title">{{ movie.title }}</div>
      <div class="movie-detail">
        <span class="movie-detail-label">Duration:</span>
        <span>{{ movie.duration_min }} min</span>
      </div>
      <div class="movie-detail">
        <span class="movie-detail-label">Genre:</span>
        <span>{{ movie.genre }}</span>
      </div>
      <div class="movie-detail">
        <span class="movie-detail-label">Rating:</span>
        <span class="rating">⭐ {{ movie.rating }}</span>
      </div>
      <div class="movie-detail">
        <span class="movie-detail-label">Year:</span>
        <span>{{ movie.release_year }}</span>
      </div>
      <div class="movie-detail">
        <span class="movie-detail-label">Country:</span>
        <span>{{ movie.country }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  movie: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
</style>
