<template>
    <div class="indicator-header">
        <h2>{{ ind.toUpperCase() }}</h2><span class='sub'>{{ indicator.label }}</span>
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
          console.log(this.ind)
          return this.baseStore.data.indicators[this.ind];
      }
    }
}
</script>
