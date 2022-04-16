<template>
    <div class="station">
        <div class="station-inner">
            <station-header :id='id'/>
            <indicator v-if='station.indices.includes("tg")' :id='id' ind='tg'/>
            <indicator v-if='station.indices.includes("tn")' :id='id' ind='tn'/>
            <indicator v-if='station.indices.includes("rr")' :id='id' ind='rr'/>
            <indicator v-if='station.indices.includes("ss")' :id='id' ind='ss'/>
        </div>
    </div>
</template>

<script>
import StationHeader from '@/aux/StationHeader.vue'

import Indicator from '@/Indicator.vue'

import { baseStore } from '@/stores/base.js'
import { stationStore } from '@/stores/station.js'

export default {
    props: ['id'],
    setup() {
        return {
            baseStore: baseStore(),
            stationStore: stationStore(),
        }
    },
    computed: {
        station () {
            return this.baseStore.station(this.id);
        }
    },
    components: {
        StationHeader, Indicator
    },
    created: function() {
        // this.$watch(
        //     () => this.$route.params,
        //     (toParams, previousParams) => {
        //         // console.log(`Loading station: ${this.$route.params.id}`)
        //         if (this.$route.params.id)
        //             this.stationStore.load(this.$route.params.id);
        //         else
        //             this.stationStore.clear();
        //         this.id = this.$route.params.id
        //     },
        //     { immediate : true}
        // )
    }
}
</script>
