import { FeatureCollection } from "geojson";
import { WMSClient } from "./WMSClient";

const mapImg = document.createElement('img')
// const client = new WMSClient('https://servizigis.regione.emilia-romagna.it/wms/geologia10k?request=GetCapabilities&service=WMS')
// const client = new WMSClient('https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystem_Map_service/MapServer/WMSServer')

const client = new WMSClient()

// http://servizigis.regione.emilia-romagna.it/wms/geologia10k?
//SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&
// BBOX=611203.8588821198791%2C4918338.889971172437%2C613791.5607797261328%2C4920219.884502353147&
// CRS=EPSG%3A32632&WIDTH=1213&HEIGHT=881&LAYERS=Unita_geologiche_10K&
// STYLES=&FORMAT=image%2Fpng&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi%3A96&TRANSPARENT=TRUE

// http://servizigis.regione.emilia-romagna.it/wms/geologia10k?
// SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&
// BBOX=611213.78043819835875183%2C4917943.91876569949090481%2C613781.63922364765312523%2C4920614.85570782609283924&
// CRS=EPSG%3A32632
// &WIDTH=847
// &HEIGHT=881&
// LAYERS=Unita_geologiche_10K
// &STYLES=&FORMAT=image%2Fpng&QUERY_LAYERS=Unita_geologiche_10K&INFO_FORMAT=text%2Fhtml&I=418&J=347

client.connect('https://servizigis.regione.emilia-romagna.it/wms/geologia10k').then((service) => {
    service.getMap(
        'Unita_geologiche_10K',
        [611203, 4918338, 613791, 4920219],
        'EPSG:32632',
        1213,
        881
    ).then((mapURL) => {
        mapImg.src = mapURL
        document.body.appendChild(mapImg)
        return service.getFeatureInfo(
            'Unita_geologiche_10K',
            [611213, 4917943, 613781, 4920614],
            'EPSG:32632',
            847,
            881,
            418,
            347
        )
    }).then((featureinfo) => {
        console.dir(featureinfo)

        const f = featureinfo as FeatureCollection
        f.features.forEach((feat) => {
            const props = feat.properties

            if (!props) return;

            for (const [key, value] of Object.entries(props)) {

                const newValue = addNewlines(value)
                console.log('<span class="featurepropname">' + key + ': </span>' + newValue)
            }
        })
    })
})

function addNewlines(str: string) {
  var result = '';
  while (str.length > 0) {
    result += str.substring(0, 80) + '<br />';
    str = str.substring(80);
  }
  return result;
}




// https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystem_Map_service/MapServer/WMSServer?
// SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&
// BBOX=10.38208224467739882%2C44.39697159536562054%2C10.44579343914663916%2C44.43392315973566298&
// CRS=CRS%3A84&WIDTH=1352&HEIGHT=784&LAYERS=2&STYLES=&FORMAT=image%2Fpng&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi%3A96&TRANSPARENT=TRUE