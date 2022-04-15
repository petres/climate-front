// import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/app.scss'
// import bootstrap from 'bootstrap'
// import 'bootstrap';

import App from './App.vue'
import List from './List.vue'
import Station from './Station.vue'
import Indicator from './Indicator.vue'
import Combined from './Combined.vue'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createWebHistory, createRouter } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/list', component: List, name: 'overview' },
    { path: '/station/:id', component: Combined, name: 'station', props: true },
    { path: '/', component: Combined, name: 'map' },
    { path: '/station/:id/:ind', component: Indicator, name: 'indicator' },
  ],
})

const app = createApp(App)
    .use(router)
    .use(createPinia())
    .mount('#app')
