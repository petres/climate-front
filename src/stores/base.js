import { defineStore } from 'pinia'
import axios from 'axios';

const sources = {
    stations: {
        src: 'data/stations.json',
        trans: d => {
            d.forEach(s => {
                // TODO: correct in preparation
                s.coords.reverse();
                if (!Array.isArray(s.indices))
                    s.indices = [s.indices];
            });

            return Object.assign({}, ...d.map((x) => ({[x.id]: x})))
        },
    },
    indicators: {
        src: 'data/indices.json',
        trans: d => d,
    },
};


export const baseStore = defineStore('base', {
    state: () => ({ data: {} }),
    getters: {
        loaded: (s) => Object.keys(sources).filter(d => !(d in s.data)).length == 0,
        station: (s) => (id) => s.data.stations[id],
        indicator: (s) => (id) => s.data.indicators[id],
        stations: (s) => () => Object.values(s.data.stations),
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
