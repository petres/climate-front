<template>
    <div class="indicator" v-if="stationStore.loaded">
        <indicator-header :ind='ind'/>
        <!-- <line-chart :id='id' :ind='ind'/> -->
        <polar-chart :id='id' :ind='ind'/>
    </div>
</template>

<script>

import PolarChart from '@/charts/Polar.vue'
import LineChart from '@/charts/Line.vue'

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
    },
    // created: function() {
    //     this.$watch(
    //         () => this.$route.params,
    //         (toParams, previousParams) => {
    //             // console.log(`Loading station: ${this.$route.params.id}`)
    //             if (this.$route.params.id)
    //                 this.stationStore.load(this.$route.params.id, this.$route.params.ind);
    //             else
    //                 this.stationStore.clear();
    //             //
    //             // this.id = this.$route.params.id
    //             // this.ind = this.$route.params.ind
    //         },
    //         { immediate : true}
    //     )
    // }
}
</script>
