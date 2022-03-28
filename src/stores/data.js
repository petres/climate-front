// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('data', {
    state: () => ({ count: 0 }),
    actions: {
        increment() {
          this.count++
        },
    },
})
