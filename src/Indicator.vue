<template>
    <div class="indicator" v-if="id && ind && stationStore.loaded">
        <indicator-header :ind='ind'/>
        <line-chart :id='id' :ind='ind' @year-change="i => years[i.t] = i.y"/>
        <select v-model='time' style="positon: absolute">
             <option value="v31">Monthly</option>
             <option value="v15">2 Weeks</option>
             <option value="v7">Week</option>
             <option value="v1">Daily</option>
        </select>
        <polar-chart :id='id' :ind='ind' :time='time' :years='years' />
    </div>
</template>

<script>

import PolarChart from '@/charts/Polar.vue'
import LineChart from '@/charts/LineYear.vue'

import IndicatorHeader from '@/aux/IndicatorHeader.vue'

import { baseStore } from '@/stores/base.js'
import { stationStore } from '@/stores/station.js'

export default {
    props: ['id', 'ind'],
    setup() {
        return {
            baseStore: baseStore(),
            stationStore: stationStore(),
        }
    },
    data: () => ({
        time: 'v31',
        years: {
            s: 2020,
            h: null,
        },
    }),
    components: {
        PolarChart, LineChart, IndicatorHeader
    }
}
</script>
