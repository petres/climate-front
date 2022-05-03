<template>
    <div class="map-wrap">
        <div class="map" ref="mapContainer"></div>
    </div>
</template>

<script>
import { baseStore } from '@/stores/base.js'
import { Map, Marker, Popup } from 'maplibre-gl';
import { shallowRef, onMounted, onUnmounted, markRaw } from 'vue';

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
		'circle-radius': 7,
		'circle-blur': 0,
		// 'circle-color': '#008729',
		'circle-opacity': 0.6,
	},
	// 'filter': ['==', '$type', 'Point']
};

var popup = new Popup({
	closeButton: false,
	closeOnClick: false,
	offset: [0, 0]
});

export default {
	props: ['id'],
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
        };
    },
	computed: {
		stationSource () {
			stationSourceTemplate.data.features = this.baseStore.stations()
				.filter(s => s.indices.includes("tg"))
				.filter(s => s.id < 100)
				.map(s => ({
					'type': 'Feature',
					'properties': {
						'id': `${s.id}`,
						'name': `${s.name}`
					},
					'geometry': {
						'type': 'Point',
						'coordinates': s.coords
					}
				}));
			return stationSourceTemplate;
		}
	},
    mounted: function() {
        // console.log(this.map)
		const self = this;
		this.map.on('load', function () {
			self.map.addSource('stations', self.stationSource);
			self.map.addLayer(circleLayer);

			self.map.on('click', 'stations', function (e) {
				// console.log(e.features[0].properties.name)
				// popup
				// 	.setLngLat(e.lngLat)
				// 	.setHTML(e.features[0].properties.name)
				// 	.addTo(self.map);
				self.$router.push({ name: 'station', params: { id: e.features[0].properties.id }})
					//alert(`Clicked ${id}`);
			});

			self.map.on('mouseenter', 'stations', function (e) {
				self.map.getCanvas().style.cursor = 'pointer';
				popup
					.setLngLat(e.lngLat)
					.setHTML(e.features[0].properties.name)
					.addTo(self.map);
			});

			self.map.on('mouseleave', 'stations', function () {
				self.map.getCanvas().style.cursor = '';
				popup.remove();
			});

			self.$watch(
				() => self.id,
				(n, o) => {
					// if (n in markers)
					// 	markers[n].getElement().classList.add('active');
					// if (o in markers)
					// 	markers[o].getElement().classList.remove('active');
				},
				{ immediate : true}
			)
		});
    },
	methods: {

	}
};
</script>
