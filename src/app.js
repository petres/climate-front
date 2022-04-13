// import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/app.scss'
// import bootstrap from 'bootstrap'
// import 'bootstrap';

import App from './App.vue'
import Overview from './Overview.vue'
import Station from './Station.vue'
import Indicator from './Indicator.vue'
import Map from './Map.vue'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createWebHistory, createRouter } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/list', component: Overview, name: 'overview' },
    { path: '/station/:id', component: Station, name: 'station' },
    { path: '/', component: Map, name: 'map' },
    { path: '/station/:id/:ind', component: Indicator, name: 'indicator' },
  ],
})

const app = createApp(App)
    .use(router)
    .use(createPinia())
    .mount('#app')
