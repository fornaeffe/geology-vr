
import ImageWMS from 'ol/source/ImageWMS.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Image as ImageLayer} from 'ol/layer.js';

import proj4 from 'proj4';
import {register} from 'ol/proj/proj4.js';
import { Projection } from 'ol/proj';

// WGS 84 / UTM zone 32N projection definition for coordinates translation
proj4.defs("EPSG:32632","+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs +type=crs")

register(proj4);

const mapDiv = document.createElement('div')
mapDiv.style.width = '1000px'
mapDiv.style.height = '1000px'
document.body.appendChild(mapDiv)
mapDiv.style.position = "fixed"
mapDiv.style.visibility = "hidden"

const map = new Map({
  target: mapDiv,
  layers: [
      new ImageLayer({
          extent: [611400, 4918216, 613400, 4920216],
          source: new ImageWMS({
              url: 'https://servizigis.regione.emilia-romagna.it/wms/agea2020_rgb',
              params: {'LAYERS': 'Agea2020_RGB'},
              ratio: 1,
              serverType: 'geoserver',
              crossOrigin: 'Anonymous'
          })
      })
  ],
  view: new View({
      center: [612400, 4919216],
      resolution: 2,
      projection: "EPSG:32632"
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