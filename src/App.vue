<template>
    <div>
        <polar-chart/>
    </div>
</template>

<script>

import PolarChart from './charts/Polar.vue'

export default {
    components: {
        PolarChart
    },
    created: function() {
        // this.$store.dispatch('init')
    }
}
</script>
