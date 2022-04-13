<template>
    <div class="map-wrap">
        <div class="map" ref="mapContainer"></div>
    </div>
</template>

<script>
import { baseStore } from '@/stores/base.js'
import { Map, Marker } from 'maplibre-gl';
import { shallowRef, onMounted, onUnmounted, markRaw } from 'vue';

export default {
    name: "Map",
    setup () {
        const mapContainer = shallowRef(null);
        const map = shallowRef(null);

        onMounted(() => {
            const state = { lng: 14.5501, lat: 47.5162, zoom: 6 };

            map.value = markRaw(new Map({
                container: mapContainer.value,
                style: 'https://demotiles.maplibre.org/style.json', // style URL
                center: [state.lng, state.lat],
                zoom: state.zoom
            }));

            //
            // new Marker()
            //     .setLngLat([14.5501, 47.5162])
            //     .addTo(map.value);
        })

        onUnmounted(() => {
            map.value.remove();
        })

        return {
            map,
            mapContainer,
            baseStore: baseStore(),
        };

    },
    mounted: function() {
        console.log(this.map)
        Object.keys(this.baseStore.data.stations).forEach(id => {
            console.log(id)
            const s = this.baseStore.data.stations[id];
            const m = new Marker()
                .setLngLat(s.coords)
                .addTo(this.map);
            m.getElement().addEventListener('click', () => {
                this.$router.push({ name: 'station', params: { id: s.id }})
                //alert(`Clicked ${id}`);
            });
        });

    }
};
</script>