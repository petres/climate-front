<template>
    <div class="station">
        <div class="station-inner" style="position: relative">
            <h2>Temperature Station Data</h2>
            <p>
                Meteorological station data collected by <a target="_blank" href="https://www.ecad.eu/dailydata/index.php">ECAD</a>
                is visualized on this page. In this dataset more than 15.000 stations included, we are only using
                a subsample which have a long history available.
            </p><p>
                The code of this website can be found at <a target="_blank" href="https://github.com/petres/climate-front">https://github.com/petres/climate-front</a> 
            </p>
            <div id="stationList" ref='stationList'>
                <ul id="station-list" class="list">
                    <!-- <li class="header">
                        <span class="country">Ctry</span>
                        <span class="name">Name</span>
                        <span class="year_min">First<br/>Year</span>
                        <span class="diff">Diff.</span>
                    </li> -->
                    <list-entry :periods='periods' v-for='e in stations' :station="e" @highlight="id => { removeHighlight(); $emit('highlight', id) }"/>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { baseStore } from '@/stores/base.js';
import ListEntry from "@/list/Entry.vue";

export default {
    setup() {
        return {
            baseStore: baseStore(),
        }
    },
    components: {
        ListEntry
    },
    props: ["highlight", "periods"],
    data: () => ({
        stations: []
    }),
    watch: {
        highlight(id) {
            // console.log(id)
            this.removeHighlight()
            if (id !== null) {
                const el = document.getElementById(`station-${id}`);
                el.classList.add('highlight');
                el.scrollIntoView({
                    // behavior: "smooth",
                    block: "center",
                });
            }
        }
    },
    mounted() {
        this.stations = this.baseStore.stations();
    },
    methods: {
        removeHighlight() {
            const container = document.getElementById('station-list');
            const elements = container.getElementsByClassName('highlight');
            for (const e of elements) {
                e.classList.remove('highlight');
            }
        }
    }
}
</script>
