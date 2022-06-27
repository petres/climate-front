<template>
    <div class="station">
        <div class="station-inner" style="position: relative">
            <h2>Temperature Stations</h2>
            <p>
                We visualize meteorological station data collected by <a target="_blank" href="https://www.ecad.eu/dailydata/index.php">ECAD</a>.
                This dataset consists of more than 15.000 stations with various time series (avg. temp, max temp, precipitation, ...),
                only stations with a long history are shown by now.
            </p><p>
                The source code of this website can be found at <a target="_blank" href="https://github.com/petres/climate-front">https://github.com/petres/climate-front</a>.
                Still under heavy development, any contribution is welcome! For any suggestion, contact me: <a target="_blank" href="https://twitter.com/preschn">@preschn</a>
            </p>
            <div id="stationList">
                <p>
                    There are {{ stations.length }} Stations with enough data in the selected comparision periods {{ baseStore.periodsText()[0] }} and {{ baseStore.periodsText()[1] }}.
                    These stations are ordered by the difference of the mean temperatures:
                </p>
                <ul id="station-list" class="list">
                    <list-entry v-for='e in stations' :station="e" @highlight="id => { removeHighlight(); $emit('highlight', id) }"/>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { baseStore } from '@/stores/base.js';
import { stationStore } from '@/stores/station.js';
import ListEntry from "@/list/Entry.vue";

export default {
    setup() {
        return {
            baseStore: baseStore(),
            stationStore: stationStore(),
        }
    },
    components: {
        ListEntry
    },
    props: ["highlight"],
    data: () => ({
        stations: []
    }),
    watch: {
        highlight(id) {
            // console.log(id)
            this.removeHighlight()
            if (id !== null) {
                const el = document.getElementById(`station-${id}`);
                if (el) {
                    el.classList.add('highlight');
                    el.scrollIntoView({
                        // behavior: "smooth",
                        block: "center",
                    });
                }
            }
        }
    },
    mounted() {
        const stations = this.stationStore.calcedStations();
        const p = {ind: "tg", period: 'yearly'};
        stations.sort((a, b) => this.stationStore.getChange({...p, ...{id: b}}) - this.stationStore.getChange({...p, ...{id: a}}));
        this.stations = stations.map(id => this.baseStore.station(id));
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
