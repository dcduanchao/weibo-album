import { createRouter, createWebHistory } from 'vue-router'
import FetchView from '../views/FetchView.vue'
import RecordsView from '../views/RecordsView.vue'
import AlbumView from '../views/AlbumView.vue'

const routes = [
  {
    path: '/',
    name: 'Fetch',
    component: FetchView
  },
  {
    path: '/records',
    name: 'Records',
    component: RecordsView
  },
  {
    path: '/album/:uid',
    name: 'Album',
    component: AlbumView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL || '/'),
  routes
})

export default router
