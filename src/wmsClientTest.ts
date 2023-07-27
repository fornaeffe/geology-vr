import { WMSClient } from "./WMSClient";


// const client = new WMSClient('https://servizigis.regione.emilia-romagna.it/wms/geologia10k?request=GetCapabilities&service=WMS')
const client = new WMSClient('https://copernicus.discomap.eea.europa.eu/arcgis/services/Corine/CLC2018_WM/MapServer/WMSServer?request=GetCapabilities&service=WMS')