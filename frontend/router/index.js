import { createRouter, createWebHistory } from 'vue-router'
import MovieGridPage from '../pages/MovieGridPage.vue'
import MovieListPage from '../pages/MovieListPage.vue'
import MovieDetailPage from '../pages/MovieDetailPage.vue'
import AdminPage from '../pages/AdminPage.vue'

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
  },
  {
    path: '/movie/:id',
    name: 'MovieDetail',
    component: MovieDetailPage,
    props: true
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
