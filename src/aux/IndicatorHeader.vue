<template>
    <div class="indicator-header">
        <h3>{{ ind.toUpperCase() }}</h3><span class='sub'>{{ indicator.label }}</span>
    </div>
</template>

<script>
import { baseStore } from '@/stores/base.js'

export default {
    props: ['ind'],
    setup() {
        return {
            baseStore: baseStore(),
        }
    },
    computed: {
      indicator () {
          return this.baseStore.data.indicators[this.ind];
      }
    }
}
</script>
