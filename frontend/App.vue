<template>
  <div id="app">
    <nav>
      <h1>🎬 Cinema</h1>
      <div class="nav-links">
        <router-link to="/">Movies Grid</router-link>
        <router-link to="/list">Movies List</router-link>
      </div>
      <button @click="$router.push('/admin')" class="admin-btn">Admin</button>
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

nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.admin-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.admin-btn:hover {
  background-color: #b20710;
}
</style>
