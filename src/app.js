// import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/app.scss'
// import bootstrap from 'bootstrap'
// import 'bootstrap';

import App from './App.vue'
import Overview from './Overview.vue'
import Station from './Station.vue'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createWebHistory, createRouter } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Overview },
    { path: '/station/:id', component: Station, name: 'station' },
  ],
})

const app = createApp(App)
    .use(router)
    .use(createPinia())
    .mount('#app')
