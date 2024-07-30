import { defineStore } from 'pinia'
import axios from 'axios';
import * as d3 from "d3";
import { isDefined, dataUrls } from '@/globals.js'
import { baseStore } from '@/stores/base.js'


const sources = {
    daily: {
        url: (i) => dataUrls.station(i.id, i.ind, 'd'),
        trans: d => d.map(d => {
            d.value == "" ? d.value = NaN : +d.value;
            d.avg7 == "" ? d.avg7 = NaN : +d.avg7;
            d.avg15 == "" ? d.avg15 = NaN : +d.avg15;
            d.avg31 == "" ? d.avg31 = NaN : +d.avg31;
            d.avg365 == "" ? d.avg365 = NaN : +d.avg365;
            return {
                date: new Date(d.date),
                v1: +d.value/10,
                v7: +d.avg7/10,
                v15: +d.avg15/10,
                v31: +d.avg31/10,
                v365: +d.avg365/10,
            }
        })
    },
    yearly: {
        url:  (i) => dataUrls.station(i.id, i.ind, 'y'),
        code: 'y',
        trans: d => d.map(d => ({
            date: new Date(`${d.date}-01-01`),
            year: +d.date,
            v1: (d.value == "" ? d.value = NaN : +d.value)/10,
        }))
    },
    yearly_combined: {
        url:  (i) => dataUrls.combined(i.ind),
        trans: d => d.map(d => ({
            id: d.id,
            date: new Date(`${d.date}-01-01`),
            year: +d.date,
            v1: (d.value == "" ? d.value = NaN : +d.value)/10,
        }))
    },
};

export const stationStore = defineStore('station', {
    state: () => ({
        yearly: {}, monthly: {}, daily: {},
        avgs: {}, change: {}, yearsLoaded: false,
    }),
    getters: {
        loaded: (s) => (p) => p.id in s[p.period] && p.ind in s[p.period][p.id],
        calced: (s) => (p) => p.id in s.avgs && p.ind in s.avgs[p.id],
        calcedStations: (s) => () => Object.keys(s.avgs).filter(id => "tg" in s.avgs[id]),
        data: (s) => (p) => s[p.period][p.id][p.ind],
        calcedAvg: (s) => (p, avg) => s.avgs[p.id][p.ind][avg],
        getChange: (s) => (p) => s.avgs[p.id][p.ind]['d'],
        average: (s) => (p, col, years) => {
            const d = s.data(p);
            const d_f = d.filter(e => isDefined(e[col]) && e.year <= years[1] && e.year >= years[0]).map(e => e[col]);
            const avg = d_f.reduce( ( p, c ) => p + c, 0 ) / d_f.length;

            return d_f.length >= (years[1] - years[0])*(3/4) ? avg : NaN;
        },
    },
    actions: {
        load(p) {
            const self = this;
            const s = sources[p.period]
            // console.log(`station store: load ${id} ${ind} ${period}`)
            return axios
                .get(s.url(p), { responseType: 'text',})
                .then(response => {
                    if (p.period == 'yearly_combined') {
                        const d = s.trans(d3.csvParse(response.data))

                        const g = Object.groupBy(d, ({ id }) => id)
                        Object.entries(g).forEach(([id, data]) => {
                            if (!(id in this['yearly']))
                                this['yearly'][id] = {}

                            self['yearly'][id][p.ind] = data
                        })
                    } else {
                        if (!(p.id in this[p.period]))
                            self[p.period][p.id] = {}

                        self[p.period][p.id][p.ind] = s.trans(d3.csvParse(response.data))
                    }
                })
        },
        calcAvgs(p, periods) {
            if (baseStore().station(p.id).year_min > periods.p1[0])
                return;
            // console.log(`calcAvgs ${p.id}`)
            const avgs = [
                { name: "p1", years: periods.p1 },
                { name: "p2", years: periods.p2 },
            ];

            if (!(p.id in this.avgs))
                this.avgs[p.id] = {}

            const avg = {
                p1: { y: periods.p1, v: this.average(p, "v1", periods.p1) },
                p2: { y: periods.p2, v: this.average(p, "v1", periods.p2) },
            }
            avg.d = avg.p2.v - avg.p1.v;

            if (!isNaN(avg.d))
                this.avgs[p.id][p.ind] = avg;
        },
        calcChangeAggs() {
            // const p = {ind: 'tg'}
            const ids = this.calcedStations();
            const diffs = ids.map(id => this.getChange({id: id, ind: 'tg'}))

            const extent = d3.extent(diffs);
            const getColor = d3.scaleLinear()
                .domain(extent)
                // .domain([0, extent[1]])
                // .domain([-extent[1], extent[1]])
                .range(['yellow', '#f23c06'])

            this.change = {
                extent, getColor
            }
        },
        loadYearly(ind) {
            const self = this;
            const bs = baseStore();
            const ids = bs.stations().map(d => d.id);

            // each station
            // Promise.all(ids.map((id) => {
            //     let p = {id: id, ind: ind, period: 'yearly'}
            //     return self.load(p).then(function() {
            //         self.calcAvgs(p, bs.periods)
            //     })
            // })).then(() => {
            //     self.calcChangeAggs();
            //     self.yearsLoaded = true;
            // })

            // combined
            let p = {ind: ind, period: 'yearly_combined'}
            self.load(p).then(() => {
                ids.forEach((id) => {
                    p.id = id;
                    self.calcAvgs({
                        id: id, 
                        ind: ind,
                        period: 'yearly'
                    }, bs.periods)
                });
                self.calcChangeAggs();
                self.yearsLoaded = true;
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
