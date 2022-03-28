// import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/app.scss'
// import bootstrap from 'bootstrap'
// import 'bootstrap';


import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'



const app = createApp(App)
    .use(createPinia())
    .mount('#app')
