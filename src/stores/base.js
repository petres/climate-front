import { defineStore } from 'pinia'
import axios from 'axios';

const sources = {
    stations: {
        src: 'data/stations.json',
        trans: d => Object.assign({}, ...d.map((x) => ({[x.id]: x}))),
    },
};


export const baseStore = defineStore('base', {
    state: () => ({ data: {} }),
    getters: {
        loaded: (s) => Object.keys(sources).filter(d => !(d in s.data)).length == 0,
    },
    actions: {
        load() {
            Object.keys(sources).forEach(d => {
                axios
                    .get(`/${sources[d].src}`)
                    .then(response => {
                        this.data[d] = sources[d].trans(response.data)
                    })
            });
        },
    },
})
