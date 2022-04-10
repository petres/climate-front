import { defineStore } from 'pinia'
import axios from 'axios';
import * as d3 from "d3";

const sources = {
    monthly: {
        src: 'tg-m.csv',
        trans: d => d.map(d => ({
            date: new Date(d.date),
            value: +d.value/10,
            avg1: +d.avg1/10,
            avg5: +d.avg5/10,
            avg10: +d.avg10/10,
        }))
    },
    daily: {
        src: 'tg-d.csv',
        trans: d => d.map(d => ({
            date: new Date(d.date),
            value: +d.value/10,
        }))
    },
};


export const stationStore = defineStore('station', {
    state: () => ({ data: {} }),
    getters: {
        loaded: (s) => Object.keys(sources).filter(d => !(d in s.data)).length == 0,
    },
    actions: {
        load(stationId) {
            console.log(stationId)
            Object.keys(sources).forEach(d => {
                axios
                    .get(`/data/stations/${stationId}/${sources[d].src}`, { responseType: 'text',})
                    .then(response => {
                        this.data[d] = sources[d].trans(d3.csvParse(response.data))
                    })
            });
        },
    },
})
