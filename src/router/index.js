import { createRouter, createWebHistory } from 'vue-router'
import FetchView from '../views/FetchView.vue'
import RecordsView from '../views/RecordsView.vue'
import AlbumView from '../views/AlbumView.vue'
import ComfyUIView from '../views/ComfyUIView.vue'
import ComfyUIEditListView from '../views/ComfyUIEditListView.vue'
import ComfyUICreateView from '../views/ComfyUICreateView.vue'
import ComfyUICreateListView from '../views/ComfyUICreateListView.vue'
import ComfyUIInfoView from '../views/ComfyUIInfoView.vue'
import GrokImageView from '../views/GrokImageView.vue'
import GrokEditView from '../views/GrokEditView.vue'
import GrokVideoView from '../views/GrokVideoView.vue'
import GrokListView from '../views/GrokListView.vue'

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
  },
  {
    path: '/comfyui',
    name: 'ComfyUI',
    component: ComfyUIView
  },
  {
    path: '/comfyui/info',
    name: 'ComfyUIInfo',
    component: ComfyUIInfoView
  },
  {
    path: '/comfyui/edit/list',
    name: 'ComfyUIEditList',
    component: ComfyUIEditListView
  },
  {
    path: '/comfyui/create',
    name: 'ComfyUICreate',
    component: ComfyUICreateView
  },
  {
    path: '/comfyui/create/list',
    name: 'ComfyUICreateList',
    component: ComfyUICreateListView
  },
  {
    path: '/grok/image',
    name: 'GrokImage',
    component: GrokImageView
  },
  {
    path: '/grok/edit',
    name: 'GrokEdit',
    component: GrokEditView
  },
  {
    path: '/grok/video',
    name: 'GrokVideo',
    component: GrokVideoView
  },
  {
    path: '/grok/list',
    name: 'GrokList',
    component: GrokListView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL || '/'),
  routes
})

export default router
