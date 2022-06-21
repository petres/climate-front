<template>
    <div class="combined">
        <station v-if='id' :id='id' />
        <intro v-else :highlight='highlightList' @highlight="id => highlightMap = id"/>
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
        highlightList: null
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
