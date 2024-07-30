import { defineStore } from 'pinia'
import axios from 'axios';

import { periods } from '@/globals.js'

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

            return Object.assign({}, ...d.filter(d => d.year_min <= periods.p1[0]).map((x) => ({[x.id]: x})))
            // return Object.assign({}, ...d.map((x) => ({[x.id]: x})))
        },
    },
    indicators: {
        src: 'data/indices.json',
        trans: d => d,
    },
};


export const baseStore = defineStore('base', {
    state: () => ({
        data: {},
        periods: periods,
        status: 'loading',
    }),
    getters: {
        loaded: (s) => () => s.status == "loaded",
        stations: (s) => () => Object.values(s.data.stations),

        station: (s) => (id) => s.data.stations[id],
        indicator: (s) => (id) => s.data.indicators[id],

        periodsText: (s) => (sep = '-') => [s.periods.p2.join(sep), s.periods.p1.join(sep)],
        periodsTextLegend: (s) => () => `Difference of mean<br/>between ${s.periods.p2[0]}-${s.periods.p2[1]}<br/>and ${s.periods.p1[0]}-${s.periods.p1[1]}<br/>in °C`,
    },
    actions: {
        load() {
            return Promise.all(Object.keys(sources).map(d => {
                return axios
                    .get(`/${sources[d].src}`)
                    .then(response => {
                        this.data[d] = sources[d].trans(response.data)
                    })
            })).then(() => {
                this.status = 'loaded';
            }).catch(err => {
                this.status = 'error';
                console.log(err.message); // some coding error in handling happened
            });
        },
    },
})
