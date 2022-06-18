<template>
    <div class="map-wrap">
		<div class="map" ref="mapContainer"></div>
        <legend-aux :scale="getColor" :formatter="formatNumber" :text="text"/>
    </div>
</template>

<script>
import { baseStore } from '@/stores/base.js'
import { Map, Marker, Popup } from 'maplibre-gl';
import { shallowRef, onMounted, onUnmounted, markRaw } from 'vue';
import LegendAux from '@/aux/Legend.vue'
import * as d3 from "d3";
import { diffFormatter } from '@/globals.js'

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
		'circle-color': ['get', 'color'],
		// 'circle-color': '#008729',
		//'circle-opacity': 0.6,
		'circle-opacity': 1,
	},
	// 'filter': ['==', '$type', 'Point']
};

var popup = new Popup({
	closeButton: false,
	closeOnClick: false,
	offset: [0, 0]
});

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
            baseStore: baseStore()
        };
    },
	components: {
		LegendAux
	},
	computed: {
		stationSource () {
			stationSourceTemplate.data.features = this.baseStore.stations()
				// .filter(s => s.indices.includes("tg"))
				// .filter(s => s.id < 100)
				.map(s => {
					const value = this.getValue(s)
					return {
						'type': 'Feature',
						'properties': {
							'id': `${s.id}`,
							'name': `${s.name} | ${diffFormatter(value/10)} °C`,
							'value': value,
							'color': this.getColor(value),
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
		getColor: null,
		formatNumber: diffFormatter,
		text: "Diff. 2010-2022 <br/>to 1940-1960 <br/>in °C",
		getValue: d => (d.mean_2010_td - d.mean_1940_1960)/10,
	}),
    mounted: function() {
		const self = this;

		self.stations = this.baseStore.stations();

		const extent = d3.extent(this.baseStore.stations(), this.getValue);
		self.getColor = d3.scaleLinear()
			.domain([0, extent[1]])
			// .domain([-extent[1], extent[1]])
			.range(['white', '#f23c06'])

		this.map.on('load', function () {
			self.map.addSource('stations', self.stationSource);
			self.map.addLayer(circleLayer);

			// self.map.on('click', 'stations', function (e) {
			// 	// console.log(e.features[0].properties.name)
			// 	// popup
			// 	// 	.setLngLat(e.lngLat)
			// 	// 	.setHTML(e.features[0].properties.name)
			// 	// 	.addTo(self.map);
			//
			// 	self.$router.push({ name: 'station', params: { id: e.features[0].properties.id }})
			// 		//alert(`Clicked ${id}`);
			// });

			// self.map.on('mouseenter', 'stations', function (e) {
			// 	self.map.getCanvas().style.cursor = 'pointer';
			// 	// popup
			// 	// 	.setLngLat(e.lngLat)
			// 	// 	.setHTML(e.features[0].properties.name)
			// 	// 	.addTo(self.map);
			//
			// 	self.setMarker(e.features[0].properties.id, 'hover')
			// 	self.$emit('highlight', e.features[0].properties.id)
			// });

			self.map.on('mousemove', function (e) {
				const p = [e.lngLat.lng, e.lngLat.lat];
				const mi = d3.minIndex(self.stations, i => Math.sqrt((i.coords[0] - p[0]) ** 2 + (i.coords[1] - p[1]) ** 2));
				self.setMarker(self.stations[mi].id, 'hover')
				self.$emit('highlight', self.stations[mi].id)
			});

			// self.map.on('mouseleave', 'stations', function () {
			// 	self.map.getCanvas().style.cursor = '';
			// 	popup.remove();
			// 	self.setMarker(null, 'hover')
			// 	self.$emit('highlight', null)
			// });

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
				const value = this.getValue(info);
				var el = document.createElement('div');
				el.className = `marker ${type}`;
				el.style.backgroundColor = this.getColor(value);
				el.innerHTML = `<span>${this.formatNumber(value)}<br/>°C</span>`;

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
