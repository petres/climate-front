<template>
    <div class="map-wrap">
		<div class="map" ref="mapContainer"></div>
        <legend-aux :scale="stationStore.change.getColor" :formatter="formatter" :text="`Difference of mean<br/>between ${baseStore.periodsText()[0]}<br/>and  ${baseStore.periodsText()[1]}<br/>in °C`"/>
    </div>
</template>

<script>
import { baseStore } from '@/stores/base.js'
import { stationStore } from '@/stores/station.js'
import { Map, Marker } from 'maplibre-gl';
import { shallowRef, onMounted, onUnmounted, markRaw } from 'vue';
import LegendAux from '@/aux/Legend.vue'
import { diffFormatter } from '@/globals.js'
import * as d3 from "d3";

const state = { lng: 14.5501, lat: 47.5162, zoom: 4 };

const style = {
	"version": 8,
	"sources": {
		"osm": {
			"type": "raster",
			"tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
			"tileSize": 256,
			"attribution": "&copy; OpenStreetMap Contributors",
			"maxzoom": 19
		}
	},
	"layers": [
		{
			"id": "osm",
			"type": "raster",
			"source": "osm"
		}
	]
};

const stationSourceTemplate = {
	'type': 'geojson',
	'data': {
		'type': 'FeatureCollection',
		'features': null
	}
}

const circleLayer = {
	'id': 'stations',
	'type': 'circle',
	'source': 'stations',
	'paint': {
		'circle-radius': 4,
		'circle-blur': 0,
		'circle-stroke-color': "#444",
		'circle-stroke-width': 1,
		'circle-color': ['get', 'color'],
		// 'circle-color': '#008729',
		//'circle-opacity': 0.6,
		'circle-opacity': 1,
	},
	// 'filter': ['==', '$type', 'Point']
};

// var popup = new Popup({
// 	closeButton: false,
// 	closeOnClick: false,
// 	offset: [0, 0]
// });

export default {
	props: ['id', 'highlight'],
    name: "Map",
    setup () {
        const mapContainer = shallowRef(null);
        const map = shallowRef(null);

        onMounted(() => {
            map.value = markRaw(new Map({
                container: mapContainer.value,
                style: style, // style URL
                center: [state.lng, state.lat],
                zoom: state.zoom
            }));
        })

        onUnmounted(() => {
            map.value.remove();
        })

        return {
            map,
            mapContainer,
			baseStore: baseStore(),
            stationStore: stationStore(),
        };
    },
	components: {
		LegendAux
	},
	computed: {
		stationSource () {
			stationSourceTemplate.data.features = this.stationStore.calcedStations()
				.map(id => {
					const s = this.baseStore.station(id);
					// const value = this.getValue(s)
					const change = this.stationStore.getChange({id: s.id, ind: 'tg'});
					return {
						'type': 'Feature',
						'properties': {
							'id': `${s.id}`,
							'name': `${s.name}`,
							// 'name': `${s.name} | ${diffFormatter(change/10)} °C`,
							'change': change,
							'color': this.stationStore.change.getColor(change),
						},
						'geometry': {
							'type': 'Point',
							'coordinates': s.coords
						}
					}
				});
			return stationSourceTemplate;
		}
	},
	data: () => ({
		markers: {
			selected: null,
			hover: null
		},
		formatter: diffFormatter,
	}),
    mounted: function() {
		const self = this;

		this.map.on('load', function () {
			self.map.addSource('stations', self.stationSource);
			self.map.addLayer(circleLayer);

			const stations = self.stationStore.calcedStations().map(id => ({id: id, coords: self.baseStore.station(id).coords}))
			// console.log(stations)
			self.map.on('mousemove', function (e) {
				const p = [e.lngLat.lng, e.lngLat.lat];
				const mi = d3.minIndex(stations, i => Math.sqrt((i.coords[0] - p[0]) ** 2 + (i.coords[1] - p[1]) ** 2));
				self.setMarker(stations[mi].id, 'hover')
				self.$emit('highlight', stations[mi].id)
			});

			self.$watch(
				() => self.id,
				(n, o) => {
					self.setMarker(n)
				},
				{ immediate : true}
			)

			self.$watch(
				() => self.highlight,
				(n, o) => {
					self.setMarker(n, 'hover')
				},
			)
		});
    },
	methods: {
		setMarker(id, type = "selected") {
			const self = this;
			if (this.markers[type] !== null) {
				this.markers[type].remove()
				this.markers[type] = null;
			}

			if (id !== null && id !== undefined) {
				const info = this.baseStore.station(id);
				const change = this.stationStore.getChange({id: id, ind: 'tg'});;
				var el = document.createElement('div');
				el.className = `marker ${type}`;
				el.style.backgroundColor = this.stationStore.change.getColor(change);
				el.innerHTML = `<span>${this.formatter(change)}<br/>°C</span>`;

				this.markers[type] = new Marker(el)
					.setLngLat(info.coords)
					.addTo(this.map);

				if(!this.map.getBounds().contains(info.coords)) {
					this.map.flyTo({
						center: info.coords,
						essential: true,
						speed: 1
					});
				}

				this.markers[type].getElement().addEventListener('click', () => {
					self.$router.push({ name: 'station', params: { id: id }})
				});
			}
		},
	}
};
</script>
