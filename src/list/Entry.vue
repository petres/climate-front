<template>
    <li :id='`station-${station.id}`' @click='$router.push({ name: "station", params: { id: station.id }})' @mouseover="$emit('highlight', station.id)" @mouseleave="$emit('highlight', null)">
        <div class="info">
            <div class="country"><span>{{ station.country }}</span></div>
            <div class="name" :title='station.name'><span>{{ station.name }}</span></div>
            <div class="year_min" title="Start year of temperature time series"><span>↦</span> <span>{{ station.year_min }}</span></div>
            <div :style="`background-color: ${this.stationStore.change.getColor(change)}`" class="diff" :title="`Temperature difference between mean ${baseStore.periodsText()[0]} and mean ${baseStore.periodsText()[1]}`">
                <!-- <span>Δ</span>  -->
                <span>{{ changeText }}</span>
            </div>
        </div>
        <div class="line">
            <line-year-simple :id='station.id' ind='tg'/>
        </div>
    </li>
</template>

<script>
import { baseStore } from '@/stores/base.js';
import { stationStore } from '@/stores/station.js'

import LineYearSimple from "@/charts/LineYearSimple.vue";
import { diffFormatter } from '@/globals.js'

export default {
    props: ["station"],
    components: {
        LineYearSimple
    },
    setup: () => ({
        stationStore: stationStore(),
        baseStore: baseStore(),
    }),
    data: () => ({
    }),
    computed: {
        p () { return {id: this.station.id, ind: "tg", period: 'yearly'}; },
        change () { return this.stationStore.getChange(this.p); },
        changeText () { return  `${diffFormatter(this.change)} °C`; },
    },
}
</script>
