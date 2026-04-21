import { createRouter, createWebHistory } from 'vue-router'
import MovieGridPage from '../pages/MovieGridPage.vue'
import MovieListPage from '../pages/MovieListPage.vue'
import MovieDetailPage from '../pages/MovieDetailPage.vue'
import AdminPage from '../pages/AdminPage.vue'
import RegistrationPage from '../pages/RegistrationPage.vue'
import SessionSelectionPage from '../pages/SessionSelectionPage.vue'
import BookingPage from '../pages/BookingPage.vue'
import BookingConfirmationPage from '../pages/BookingConfirmationPage.vue'

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
    path: '/register',
    name: 'Registration',
    component: RegistrationPage
  },
  {
    path: '/session-selection',
    name: 'SessionSelection',
    component: SessionSelectionPage
  },
  {
    path: '/booking',
    name: 'Booking',
    component: BookingPage
  },
  {
    path: '/booking-confirmation',
    name: 'BookingConfirmation',
    component: BookingConfirmationPage
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
