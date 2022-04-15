import { defineStore } from 'pinia'
import axios from 'axios';
import * as d3 from "d3";

const sources = {
    monthly: {
        src: 'm.csv',
        trans: d => d.map(d => ({
            date: new Date(d.date),
            value: +d.value/10,
            avg1: +d.avg1/10,
            avg5: +d.avg5/10,
            avg10: +d.avg10/10,
        }))
    },
    daily: {
        src: 'd.csv',
        trans: d => d.map(d => ({
            date: new Date(d.date),
            value: +d.value/10,
        }))
    },
};


export const stationStore = defineStore('station', {
    state: () => ({ monthly: {}, daily: {} }),
    getters: {
        loaded: (s) => (p) => p.id in s[p.period] && p.ind in s[p.period][p.id],
        data: (s) => (p) => s[p.period][p.id][p.ind]
    },
    actions: {
        load(p) {
            // console.log(`station store: load ${id} ${ind} ${period}`)
            return axios
                .get(`/data/stations/${p.id}/${p.ind}-${sources[p.period].src}`, { responseType: 'text',})
                .then(response => {
                    if (!(p.id in this[p.period]))
                        this[p.period][p.id] = {}

                    this[p.period][p.id][p.ind] = sources[p.period].trans(d3.csvParse(response.data))
                })
        }
    },
})
