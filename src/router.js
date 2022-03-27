import Vue from 'vue';
import VueRouter from 'vue-router';

import App from "./App.vue";

Vue.use(VueRouter)

export const router = new VueRouter({
    base: PUBLIC_PATH,
    mode: 'history',
    routes: [{
        name: 'overview',
        path: '/',
        component: App
    }, {
        name: 'topic',
        path: '/B/:nr',
        component: App
    }, {
        name: 'target',
        path: '/Z/:id',
        component: App
    }]
})
