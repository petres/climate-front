<template>
    <div class="combined">
        <station v-if='id' :id='id' />
        <intro v-else :highlight='highlightList' :periods='periods' @highlight="id => highlightMap = id"/>
        <station-map :id='id' :highlight='highlightMap' @highlight="id => highlightList = id"/>
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
    data: () => ({
        highlightMap: null,
        highlightList: null,
        periods: [
            { years: [1940, 1960]},
            { years: [2010, 2022]},
        ]
    }),
    created: function() {
        // this.$store.dispatch('init')
    },
    methods: {
        show(e) {
            console.log(e)
        }
    }
}
</script>
