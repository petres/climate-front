<template>
    <div class="station">
        <div class="station-inner" style="position: relative">
            <h2>Climate Data</h2>
            <p>Meteorological station data collected by <a href="https://www.ecad.eu/dailydata/index.php">ECAD</a> is visualized on this page. In this dataset more than 15000 stations included, we are only using a subsample which have a long history available.</p>
            <div id="stationList" ref='stationList'>
                <!-- <input class="fuzzy-search" placeholder="Search" /> -->

                <div class='header'>
                    <span class='country sort' data-sort='country'>⇅</span>
                    <span class='name sort' data-sort='name'>⇅ <input onclick="event.stopPropagation()" type="text" class="search" /></span>
                    <span class='year_min sort' data-sort='year_min'>⇅</span>
                </div>
                <ul class="list"></ul>
                <div style="display:none;">
                    <li id='template-item'>
                        <span class="id" style="display: none;"></span>
                        <span class="country"></span>
                        <span class="name"></span>
                        <span class="year_min"></span> <span class="mean_1940_1960"></span>  <span class="mean_2010_td"></span>
                    </li>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { baseStore } from '@/stores/base.js';
import List from "list.js";

export default {
    setup() {
        return {
            baseStore: baseStore(),
        }
    },
    mounted() {
        const self = this;
        const options = {
          valueNames: [
              'id', 'name', 'country', 'year_min',
              'mean_1940_1960', 'mean_2010_td'
          ],
          // item: '<li><h3 class="id"></h3><p class="name"></p><p class="country"></p></li>',
          item: 'template-item'
        };

        const values = this.baseStore.stations();

        const sl = new List("stationList", options, values);
        sl.sort('country', { order: "asc" });

        this.$refs.stationList.addEventListener('click', function(e) {
            self.$router.push({ name: 'station', params: { id: e.target.closest('li').querySelector('.id').innerHTML }})
        })
    }
}
</script>
