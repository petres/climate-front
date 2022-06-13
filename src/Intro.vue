<template>
    <div class="station">
        <div class="station-inner" style="position: relative">
            <h2>Climate Data</h2>
            <p>Meteorological station data collected by <a href="https://www.ecad.eu/dailydata/index.php">ECAD</a> is visualized on this page. In this dataset more than 15000 stations included, we are only using a subsample which have a long history available.</p>
            <div id="stationList" ref='stationList'>
                <!-- <input class="fuzzy-search" placeholder="Search" /> -->


                <ul id="station-list" class="list">
                    <li class="header">
                        <span class="country">Ctry</span>
                        <span class="name">Name</span>
                        <span class="year_min">First<br/>Year</span>
                        <span class="mean_1940_1960">Mean<br/>1940-1960</span>
                        <span class="mean_2010_td">Mean<br/>2010-today</span>
                        <span class="diff">Diff.</span>
                    </li>
                    <li v-for='e in stations' :id='`station-${e.id}`' @mouseover="removeHighlight(); $emit('highlight', e.id)" @mouseleave="$emit('highlight', null)" @click='$router.push({ name: "station", params: { id: e.id }})'>
                        <span class="country">{{ e.country }}</span>
                        <span class="name">{{ e.name }}</span>
                        <span class="year_min">{{ e.year_min }}</span>
                        <span class="mean_1940_1960">{{ Math.round(e.mean_1940_1960)/10 }} °C</span>
                        <span class="mean_2010_td">{{ Math.round(e.mean_2010_td)/10 }} °C</span>
                        <span class="diff">{{ Math.round(e.mean_2010_td - e.mean_1940_1960)/10 }} °C</span>
                        <line-year-simple :id='e.id' ind='tg' />
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { baseStore } from '@/stores/base.js';
import List from "list.js";
import LineYearSimple from "@/charts/LineYearSimple.vue";

export default {
    setup() {
        return {
            baseStore: baseStore(),
        }
    },
    components: {
        LineYearSimple
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
                el.classList.add('highlight');
                el.scrollIntoView({
                    behavior: "smooth",
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
