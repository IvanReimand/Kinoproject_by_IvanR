import { createRouter, createWebHistory } from 'vue-router'
import MovieGridPage from '../pages/MovieGridPage.vue'
import MovieListPage from '../pages/MovieListPage.vue'

const routes = [
  {
    path: '/',
    name: 'MovieGrid',
    component: MovieGridPage
  },
  {
    path: '/list',
    name: 'MovieList',
    component: MovieListPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
