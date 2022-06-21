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
    state: () => ({
        yearly: {}, monthly: {}, daily: {}, avgs: {},
    }),
    getters: {
        loaded: (s) => (p) => p.id in s[p.period] && p.ind in s[p.period][p.id],
        calced: (s) => (p) => p.id in s.avgs && p.ind in s.avgs[p.id],
        data: (s) => (p) => s[p.period][p.id][p.ind],
        calcedAvg: (s) => (p, avg) => s.avgs[p.id][p.ind][avg],
        diff: (s) => (p) => s.avgs[p.id][p.ind]['d'],
        average: (s) => (p, col, years) => {
            const d = s.data(p);
            const d_f = d.filter(e => isDefined(e[col]) && e.year <= years[1] && e.year >= years[0]).map(e => e[col]);
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
        load(p) {
            // console.log(`station store: load ${id} ${ind} ${period}`)
            return axios
                .get(`/data/stations/${p.id}/${p.ind}-${sources[p.period].src}`, { responseType: 'text',})
                .then(response => {
                    if (!(p.id in this[p.period]))
                        this[p.period][p.id] = {};

                    this[p.period][p.id][p.ind] = sources[p.period].trans(d3.csvParse(response.data));
                })
        },
        calcAvgs(p, periods) {
            // console.log(`calcAvgs ${p.id}`)
            const avgs = [
                { name: "p1", years: periods[0].years },
                { name: "p2", years: periods[1].years },
            ];

            if (!(p.id in this.avgs))
                this.avgs[p.id] = {}

            const avg = {
                p1: { y: periods[0].years, v: this.average(p, "v1", periods[0].years) },
                p2: { y: periods[1].years, v: this.average(p, "v1", periods[1].years) },
            }
            avg.d = avg.p2.v - avg.p1.v;

            this.avgs[p.id][p.ind] = avg;
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
