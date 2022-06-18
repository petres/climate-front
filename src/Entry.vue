<template>
    <li :id='`station-${station.id}`'>
        <div class="info">
            <div class="country"><span>{{ station.country }}</span></div>
            <div class="name" :title='station.name'><span>{{ station.name }}</span></div>
            <div class="year_min" title="Start year of temperature time series"><span>↦</span> <span>{{ station.year_min }}</span></div>
            <div class="diff" title="Temperature differance"><span>Δ</span> <span>{{ diffFormatter((station.mean_2010_td - station.mean_1940_1960)/10) }} °C</span></div>
        </div>
        <div class="line">
            <line-year-simple :id='station.id' ind='tg' :periods='periods'/>
        </div>
    </li>
</template>

<script>
import { baseStore } from '@/stores/base.js';
import LineYearSimple from "@/charts/LineYearSimple.vue";
import { diffFormatter } from '@/globals.js'

export default {
    props: ["periods", "station"],
    components: {
        LineYearSimple
    },
    data: () => ({
        diffFormatter: diffFormatter
    }),
    mounted() {

    }
}
</script>
