<template>
    <div v-if="dataStore.loaded">
        <router-view></router-view>
    </div>
</template>

<script>

// import PolarChart from '@/charts/Polar.vue'
// import LineChart from '@/charts/Line.vue'

import Station from '@/Station.vue'

import { baseStore } from '@/stores/base.js'

export default {
    setup() {
        const ds = baseStore()
        ds.load()

        return {
            dataStore: ds
        }
    },
    components: {
        // PolarChart, LineChart
        Station
    },
    created: function() {
        // this.$store.dispatch('init')
    }
}
</script>
