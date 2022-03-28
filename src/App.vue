<template>
    <div v-if="dataStore.loaded">
        <!-- <line-chart/> -->
        <polar-chart/>
        {{ dataStore.count }}
    </div>
</template>

<script>

import PolarChart from '@/charts/Polar.vue'
import LineChart from '@/charts/Line.vue'

import { dataStore } from '@/stores/data.js'

export default {
    setup() {
        const ds = dataStore()
        ds.load()

        return {
            dataStore: ds
        }
    },
    components: {
        PolarChart, LineChart
    },
    created: function() {
        // this.$store.dispatch('init')
    }
}
</script>
