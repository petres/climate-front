<template>
    <div class="station-header">
        <h2>{{ station.name }}</h2>
        <span class='sub'>
            Id: {{ station.id }},
            Height: {{ station.height }},
            Coords: {{ station.coords }}, 
            Indices: {{ station.indices }}
        </span>
    </div>
</template>

<script>
import { baseStore } from '@/stores/base.js'

export default {
    props: ['id'],
    setup() {
        return {
            baseStore: baseStore(),
        }
    },
    computed: {
      station () {
        return this.baseStore.station(this.id);
      }
    }
}
</script>
