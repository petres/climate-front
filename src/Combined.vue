<template>
    <div class="combined">
        <station v-if='id' :id='id'/>
        <maap :id='id'/>
    </div>
</template>

<script>
import Maap from '@/Map2.vue'
import Station from '@/Station.vue'

export default {
    props: ['id'],
    setup() {
    },
    components: {
        Maap, Station
    },
    created: function() {
        // this.$store.dispatch('init')
    }
}
</script>
