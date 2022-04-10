<template>
    <div v-if="stationStore.loaded">
        <h2>{{ baseStore.data.stations[id].id }} {{ baseStore.data.stations[id].name }}</h2>
        <line-chart/>
        <polar-chart/>
    </div>
</template>

<script>

import PolarChart from '@/charts/Polar.vue'
import LineChart from '@/charts/Line.vue'

import { baseStore } from '@/stores/base.js'
import { stationStore } from '@/stores/station.js'

export default {
    data() {
        return {
            id: null
        }
    },
    setup() {
        return {
            baseStore: baseStore(),
            stationStore: stationStore(),
        }
    },
    components: {
        PolarChart, LineChart
    },
    created: function() {
        this.$watch(
            () => this.$route.params,
            (toParams, previousParams) => {
                // console.log(`Loading station: ${this.$route.params.id}`)
                this.stationStore.load(this.$route.params.id)
                this.id = this.$route.params.id
            },
            { immediate : true}
        )
    }
}
</script>
