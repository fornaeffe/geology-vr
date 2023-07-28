import { WMSClient } from "./WMSClient";

const mapImg = document.createElement('img')
// const client = new WMSClient('https://servizigis.regione.emilia-romagna.it/wms/geologia10k?request=GetCapabilities&service=WMS')
const client = new WMSClient('https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystem_Map_service/MapServer/WMSServer', 'WMS')

client.addEventListener('connected', () => {
    client.getMap(
        '2',
        [10.38208224, 44.39697159, 10.445793439, 44.433923159],
        'CRS:84',
        1352,
        784
    ).then((mapURL) => {
        mapImg.src = mapURL
        document.body.appendChild(mapImg)
    })
})




// https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystem_Map_service/MapServer/WMSServer?
// SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&
// BBOX=10.38208224467739882%2C44.39697159536562054%2C10.44579343914663916%2C44.43392315973566298&
// CRS=CRS%3A84&WIDTH=1352&HEIGHT=784&LAYERS=2&STYLES=&FORMAT=image%2Fpng&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi%3A96&TRANSPARENT=TRUE