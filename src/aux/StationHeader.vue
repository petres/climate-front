<template>
    <div class="station-header">
        <h2>{{ station.name }}</h2>
        <span class='sub'>
            Id: {{ station.id }},
            Height: {{ station.height }},
            Coords: {{ station.coords }}, 
            Indices: [ <span v-for="i, idx in station.indices"><template v-if=idx != 0>, </template><a target="_blank" :href="dataUrl(i)">{{ i }}</a></span> ]
        </span>
    </div>
</template>

<script>
import { baseStore } from '@/stores/base.js'
import { dataUrls } from '@/globals.js'

export default {
    props: ['id'],
    setup() {
        return {
            baseStore: baseStore(),
        }
    },
    computed: {
        station() {
            return this.baseStore.station(this.id);
        },
        dataUrl() { 
            return (type) => dataUrls.station(this.id, type, "d");
        }
    }
}
</script>
