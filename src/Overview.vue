<template>
    <div>
        <div v-for="s in baseStore.data.stations">
            <router-link :to="{ name: 'station', params: { id: s.id }}">
                {{ s.id }} {{ s.name }} {{ s.height }}
            </router-link>
            &nbsp;
            <template v-for="i in s.indices">
                <router-link :to="{ name: 'station', params: { id: s.id }}">{{ i }}</router-link>&nbsp;
            </template>
        </div>
    </div>
</template>

<script>

import { baseStore } from '@/stores/base.js'

export default {
    data() {
        return {
            id: null
        }
    },
    setup() {
        return {
            baseStore: baseStore(),
        }
    },
    components: {
    },
    created: function() {

    }
}
</script>
