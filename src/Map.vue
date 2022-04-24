<template>
    <div class="map-wrap">
        <div class="map" ref="mapContainer"></div>
    </div>
</template>

<script>
import { baseStore } from '@/stores/base.js'
import { Map, Marker, Popup } from 'maplibre-gl';
import { shallowRef, onMounted, onUnmounted, markRaw } from 'vue';

// Define the map syle (OpenStreetMap raster tiles)
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
      "source": "osm" // This must match the source key above
    }
  ]
};

export default {
	props: ['id'],
    name: "Map",
    setup () {
        const mapContainer = shallowRef(null);
        const map = shallowRef(null);

        onMounted(() => {
            const state = { lng: 14.5501, lat: 47.5162, zoom: 6 };

            map.value = markRaw(new Map({
                container: mapContainer.value,
				style: 'https://demotiles.maplibre.org/style.json', // style URL
                style: style, // style URL
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
        // console.log(this.map)
		const self = this;
		this.map.on('load', function () {
			const markers = {};

			// Create a popup, but don't add it to the map yet.
			var popup = new Popup({
				closeButton: false,
				closeOnClick: false,
				offset: [0, -20]
			});

			//
			// map.on('mouseleave', 'places', function () {
			// 	map.getCanvas().style.cursor = '';
			// 	popup.remove();
			// });

	        Object.keys(self.baseStore.data.stations).forEach(id => {
				if (id > 100)
					return;
	            // console.log(id)
	            const s = self.baseStore.station(id);
	            const m = new Marker({
					scale: 0.7
				})  .setLngLat(s.coords)
	                .addTo(self.map);

				m.getElement().addEventListener('mouseenter', () => {
					popup.setLngLat(s.coords).setHTML(s.name).addTo(self.map);
				});

				m.getElement().addEventListener('mouseleave', () => {
					popup.remove();
				});

				// m.setPopup(new Popup().setHTML(s.name))

	            m.getElement().addEventListener('click', () => {
	                self.$router.push({ name: 'station', params: { id: s.id }})
	                //alert(`Clicked ${id}`);
	            });
				markers[id] = m;
	        });

			// self.map.addSource('stations', {
			// 	'type': 'geojson',
			// 	'data': {
			// 		'type': 'FeatureCollection',
			// 		'features': Object.keys(self.baseStore.data.stations).map(id => {
			// 			const station = self.baseStore.station(id);
			// 			const entry = {
			// 				'type': 'Feature',
			// 				'properties': {
			// 					'name': `<strong>${station.name}</p>`
			// 				},
			// 				'geometry': {
			// 					'type': 'Point',
			// 					'coordinates': station.coords.map(a => a[0])
			// 				}
			// 			}
			// 			// console.log(entry)
			// 			return entry;
			// 		})
			// 	}
			// });
			//
			// self.map.addLayer({
			// 	'id': 'stations',
			// 	'type': 'symbol',
			// 	'source': 'stations',
			// 	// 'layout': {
			// 	// 	//'icon-image': 'custom-marker',
			// 	// 	'icon-overlap': 'always'
			// 	// }
			// });

			// map.on('mouseenter', 'places', function (e) {
			// 	// Change the cursor style as a UI indicator.
			// 	map.getCanvas().style.cursor = 'pointer';
			//
			// 	var coordinates = e.features[0].geometry.coordinates.slice();
			// 	var description = e.features[0].properties.description;
			//
			// 	// Ensure that if the map is zoomed out such that multiple
			// 	// copies of the feature are visible, the popup appears
			// 	// over the copy being pointed to.
			// 	while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			// 		coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
			// 	}
			//
			// 	// Populate the popup and set its coordinates
			// 	// based on the feature found.
			// 	popup.setLngLat(coordinates).setHTML(description).addTo(map);
			// 	});
			//
			// 	map.on('mouseleave', 'places', function () {
			// 	map.getCanvas().style.cursor = '';
			// 	popup.remove();
			// });



			self.$watch(
				() => self.id,
				(n, o) => {
					if (n in markers)
						markers[n].getElement().classList.add('active');
					if (o in markers)
						markers[o].getElement().classList.remove('active');
				},
				{ immediate : true}
			)
		});

    }
};
</script>
