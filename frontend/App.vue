<template>
  <div id="app">
    <nav>
      <h1>🎬 Cinema</h1>
      <router-link to="/">Movies Grid</router-link>
      <router-link to="/list">Movies List</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
</script>

<style scoped>
h1 {
  color: var(--primary-color);
  font-size: 1.5rem;
  margin-right: auto;
}
</style>
