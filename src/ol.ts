import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';

const mapDiv = document.createElement('div')
mapDiv.style.width = '1000px'
mapDiv.style.height = '1000px'
document.body.appendChild(mapDiv)
mapDiv.style.position = "fixed"
mapDiv.style.visibility = "hidden"

const map = new Map({
  target: mapDiv,
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

map.on('rendercomplete', (e) => {
    console.log('render complete')
    const mapCanvas = mapDiv.getElementsByTagName('canvas')[0]

    if (!mapCanvas) throw new TypeError('Unable to find mapCanvas')

    const img = mapCanvas.toDataURL('image/png')

    const mapImg = document.getElementById('map-img')

    if (!(mapImg instanceof HTMLImageElement)) throw new Error('Unable to find map-img')

    mapImg.src = img

})