import { WMSClient } from "./WMSClient";

const mapImg = document.createElement('img')
// const client = new WMSClient('https://servizigis.regione.emilia-romagna.it/wms/geologia10k?request=GetCapabilities&service=WMS')
// const client = new WMSClient('https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystem_Map_service/MapServer/WMSServer')

const client = new WMSClient()

client.connect('https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystem_Map_service/MapServer/WMSServer').then((service) => {
    service.getMap(
        '2',
        [10.38208224, 44.39697159, 10.445793439, 44.433923159],
        'CRS:84',
        1352,
        784
    ).then((mapURL) => {
        mapImg.src = mapURL
        document.body.appendChild(mapImg)
        return service.getFeatureInfo(
            '2',
            [10.403135325028, 44.41458669139024, 10.4032404590122, 44.41466178799623],
            'CRS:84',
            2,
            2,
            0,
            1
        )
    }).then((responseHTML) => {
        const doc = new DOMParser().parseFromString(responseHTML, 'text/html')
        const children = doc.children
        for (let i = 0; i < children.length; i++) {
            const item = children.item(i)
            if (!item)
                continue;
            
            document.body.append(item)
        }
    })
})






// https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystem_Map_service/MapServer/WMSServer?
// SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&
// BBOX=10.38208224467739882%2C44.39697159536562054%2C10.44579343914663916%2C44.43392315973566298&
// CRS=CRS%3A84&WIDTH=1352&HEIGHT=784&LAYERS=2&STYLES=&FORMAT=image%2Fpng&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi%3A96&TRANSPARENT=TRUE