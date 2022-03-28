import { defineStore } from 'pinia'
import axios from 'axios';

export const dataStore = defineStore('data', {
    state: () => ({ data: null, loaded: false }),
    actions: {
        load() {
            axios
                .get(`data/vienna.json`)
                .then(response => {
                    this.data = response.data.data.map(d => ({
                        date: new Date(d.date),
                        value: +d.value/10,
                        avg1: +d.avg1/10,
                        avg5: +d.avg5/10,
                        avg10: +d.avg10/10,
                    }));
                    this.loaded = true;
                    // console.log(this.data)
                })

        },
    },
})
