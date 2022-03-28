<template>
    <div>
        <line-chart/>
        {{ count }}
    </div>
</template>

<script>

import PolarChart from './charts/Polar.vue'
import LineChart from './charts/Line.vue'

import { useCounterStore } from './stores/data.js'

export default {
    setup() {
        const counter = useCounterStore()

        counter.count++
        // with autocompletion ✨
        counter.$patch({ count: counter.count + 1 })
        // or using an action instead
        counter.increment()

        return {
            count: counter.count
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
