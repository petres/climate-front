<template>
    <div class="indicator" v-if="id && ind && stationStore.loaded">
        <indicator-header :ind='ind'/>
        <line-chart :id='id' :ind='ind'/>
        <polar-chart :id='id' :ind='ind'/>
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
    components: {
        PolarChart, LineChart, IndicatorHeader
    }
}
</script>
