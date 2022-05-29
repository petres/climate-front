<template>
    <div class="combined">
        <station v-if='id' :id='id'/>
        <intro v-else/>
        <station-map :id='id'/>
    </div>
</template>

<script>
import StationMap from '@/Map.vue'
import Station from '@/Station.vue'
import Intro from '@/Intro.vue'

export default {
    props: ['id'],
    setup() {
    },
    components: {
        StationMap, Station, Intro
    },
    created: function() {
        // this.$store.dispatch('init')
    }
}
</script>
