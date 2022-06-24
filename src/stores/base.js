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

            return Object.assign({}, ...d.filter(d => d.year_min <= 1900).map((x) => ({[x.id]: x})))
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
        periods: [
            { years: [1900, 2000]},
            { years: [2000, 2022]},
        ],
    }),
    getters: {
        loaded: (s) => Object.keys(sources).filter(d => !(d in s.data)).length == 0,
        station: (s) => (id) => s.data.stations[id],
        indicator: (s) => (id) => s.data.indicators[id],
        stations: (s) => () => Object.values(s.data.stations),
        periodsTextTitle: (s) => () => `Temperature difference between mean ${s.periods[0].years[0]} - ${s.periods[0].years[1]} and mean ${s.periods[1].years[0]} - ${s.periods[1].years[1]}`,
        periodsTextLegend: (s) => () => `Difference of mean<br/>between ${s.periods[1].years[0]}-${s.periods[1].years[1]}<br/>and ${s.periods[0].years[0]}-${s.periods[0].years[1]}<br/>in °C`,
    },
    actions: {
        load() {
            return Promise.all(Object.keys(sources).map(d => {
                return axios
                    .get(`/${sources[d].src}`)
                    .then(response => {
                        this.data[d] = sources[d].trans(response.data)
                    })
            }));
        },
    },
})
