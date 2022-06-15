import { defineStore } from 'pinia'
import axios from 'axios';
import * as d3 from "d3";
import { isDefined } from '@/globals.js'

const sources = {
    daily: {
        src: 'd.csv',
        trans: d => d.map(d => ({
            date: new Date(d.date),
            v1: +d.value/10,
            v7: +d.avg7/10,
            v15: +d.avg15/10,
            v31: +d.avg31/10,
            v365: +d.avg365/10,
        }))
    },
    // monthly: {
    //     src: 'm.csv',
    //     trans: d => d.map(d => ({
    //         date: new Date(`${d.date}-01`),
    //         v1: +d.value/10,
    //         v13: +d.avg13/10,
    //         v61: +d.avg61/10,
    //         v121: +d.avg121/10,
    //     }))
    // },
    yearly: {
        src: 'y.csv',
        trans: d => d.map(d => ({
            date: new Date(`${d.date}-01-01`),
            year: +d.date,
            v1: +d.value/10,
        }))
    },
};


export const stationStore = defineStore('station', {
    state: () => ({ yearly: {}, monthly: {}, daily: {} }),
    getters: {
        loaded: (s) => (p) => p.id in s[p.period] && p.ind in s[p.period][p.id],
        data: (s) => (p) => s[p.period][p.id][p.ind],
        average: (s) => (p, col, y0 = 0, y1 = Infinity) => {
            const d = s.data(p);
            const d_f = d.filter(e => isDefined(e[col]) && e.year <= y1 && e.year >= y0).map(e => e[col]);
            const avg = d_f.reduce( ( p, c ) => p + c, 0 ) / d_f.length;

            return avg;
        },
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
        },
        onLoaded(p, f) {
            // console.log('onLoaded')
            // console.log(p)
            const fa = () => f(this.data(p))
            if (this.loaded(p)) {
                fa()
            } else {
                this.load(p).then(fa)
            }
        }
    },
})
