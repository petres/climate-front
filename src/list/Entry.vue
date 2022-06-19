<template>
    <li v-if="loaded" :id='`station-${station.id}`' @click='$router.push({ name: "station", params: { id: station.id }})' @mouseover="$emit('highlight', station.id)" @mouseleave="$emit('highlight', null)">
        <div class="info">
            <div class="country"><span>{{ station.country }}</span></div>
            <div class="name" :title='station.name'><span>{{ station.name }}</span></div>
            <div class="year_min" title="Start year of temperature time series"><span>↦</span> <span>{{ station.year_min }}</span></div>
            <div class="diff" title="Temperature differance"><span>Δ</span> <span>{{ diffFormatter(diff) }} °C</span></div>
        </div>
        <div class="line">
            <line-year-simple :id='station.id' ind='tg' :periods='periods'/>
        </div>
    </li>
</template>

<script>
import { baseStore } from '@/stores/base.js';
import { stationStore } from '@/stores/station.js'

import LineYearSimple from "@/charts/LineYearSimple.vue";
import { diffFormatter } from '@/globals.js'


export default {
    props: ["periods", "station"],
    components: {
        LineYearSimple
    },
    setup() {
        return {
            stationStore: stationStore(),
            baseStore: baseStore()
        }
    },
    data: () => ({
        diffFormatter: diffFormatter,
        diff: 0,
    }),
    computed: {
        loaded () { return this.stationStore.loaded(this.p) },
        p () { return {id: this.station.id, ind: "tg", period: 'yearly'}; },
    },
    mounted() {
        this.stationStore.onLoaded(this.p, d => {
            this.diff =
                this.stationStore.average(this.p, "v1", this.periods[1].years[0], this.periods[1].years[1]) -
                this.stationStore.average(this.p, "v1", this.periods[0].years[0], this.periods[0].years[1]);
            // this.data = d.filter(d => d.date.getFullYear() >= 1936)
            // this.plot();
            // this.plotPath();
        })
    }
}
</script>
