/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/WMSClient.ts":
/*!**************************!*\
  !*** ./src/WMSClient.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WMSClient: () => (/* binding */ WMSClient),
/* harmony export */   WMSService: () => (/* binding */ WMSService)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Layer {
    constructor(name, title, queryable, abstract, CRS) {
        this.name = name;
        this.title = title;
        this.queryable = queryable;
        this.abstract = abstract;
        this.CRS = CRS || [];
    }
}
class WMSService {
    // TODO abstract
    // TODO online resource
    // TODO contact information
    // TODO layer limit
    // TODO maxwidth
    // TODO maxheight
    constructor(baseURL, version, title, layers) {
        this.baseURL = baseURL;
        this.version = version;
        this.title = title;
        this.layers = layers;
    }
    // TODO allow multiple layers
    getMap(layerName, boundingBox, CRS, width, height) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if layer exists
            const layer = this.layers.find((l) => l.name == layerName);
            if (!layer)
                throw new Error('Layer ' + layerName + ' not found in service ' + this.title);
            // Check if layer accepts this CRS
            if (!(layer.CRS.includes(CRS)))
                throw new Error('Layer ' + layerName + ' does not list CRS ' + CRS);
            // Check if bounding box is out of CRS bounds
            // TODO write code here
            // TODO check is image dimension is too big
            // TODO check if resolution is out of bounds
            // Build the URL
            const url = new URL(this.baseURL);
            url.searchParams.append('SERVICE', 'WMS');
            url.searchParams.append('VERSION', this.version);
            url.searchParams.append('REQUEST', 'GetMap');
            url.searchParams.append('BBOX', boundingBox.join(','));
            url.searchParams.append('CRS', CRS);
            url.searchParams.append('WIDTH', width.toFixed(0));
            url.searchParams.append('HEIGHT', height.toFixed(0));
            url.searchParams.append('LAYERS', layerName);
            // TODO get from Capabilities options for parameters below
            url.searchParams.append('STYLES', '');
            url.searchParams.append('FORMAT', 'image/png');
            url.searchParams.append('DPI', '96');
            url.searchParams.append('MAP_RESOLUTION', '96');
            url.searchParams.append('FORMAT_OPTIONS', 'dpi:96');
            url.searchParams.append('TRANSPARENT', 'TRUE');
            // Fetch URL
            const response = yield fetch(url, {
                cache: 'force-cache'
            });
            // Return a local URL for the dowloaded image
            const blob = yield response.blob();
            const blobURL = URL.createObjectURL(blob);
            return blobURL;
            // TODO catch errors
        });
    }
    // TODO allow multiple layers, and/or different map layer and query layer
    getFeatureInfo(layerName, boundingBox, CRS, width, height, i, j) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if layer exists
            const layer = this.layers.find((l) => l.name == layerName);
            if (!layer)
                throw new Error('Layer ' + layerName + ' not found in service ' + this.title);
            // Check if layer accepts this CRS
            if (!(layer.CRS.includes(CRS)))
                throw new Error('Layer ' + layerName + ' does not list CRS ' + CRS);
            // Check if layer is queryable
            if (!layer.queryable) {
                throw new Error('Layer ' + layerName + ' is not queryable');
            }
            // Check if bounding box is out of CRS bounds
            // TODO write code here
            // TODO check is image dimension is too big
            // TODO check if resolution is out of bounds
            // Build the URL
            const url = new URL(this.baseURL);
            url.searchParams.append('SERVICE', 'WMS');
            url.searchParams.append('VERSION', this.version);
            url.searchParams.append('REQUEST', 'GetFeatureInfo');
            url.searchParams.append('BBOX', boundingBox.join(','));
            url.searchParams.append('CRS', CRS);
            url.searchParams.append('WIDTH', width.toFixed(0));
            url.searchParams.append('HEIGHT', height.toFixed(0));
            url.searchParams.append('LAYERS', layerName);
            // TODO get from Capabilities options for parameters below
            url.searchParams.append('STYLES', '');
            url.searchParams.append('FORMAT', 'image/png');
            url.searchParams.append('QUERY_LAYERS', layerName);
            url.searchParams.append('INFO_FORMAT', 'application/geojson');
            url.searchParams.append('I', i.toFixed(0));
            url.searchParams.append('J', j.toFixed(0));
            // Fetch URL
            const response = yield fetch(url);
            // return response.text()
            return response.json();
            // TODO catch errors
        });
    }
}
class WMSClient {
    connect(url) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // Parse URL provided
            const baseURL = url.split("?")[0];
            const getCapabilitiesURL = new URL(baseURL);
            getCapabilitiesURL.searchParams.append('SERVICE', 'WMS');
            getCapabilitiesURL.searchParams.append('REQUEST', 'GetCapabilities');
            // Fetch URL and parse response into a DOM
            const response = yield fetch(getCapabilitiesURL);
            const xml = yield response.text();
            const dom = new DOMParser().parseFromString(xml, 'text/xml');
            // Now get info from response using XPath
            // GetCapabilities XML document should have a default namespace and no prefixes,
            // so the only way I found to make XPath works is this custom namespace resolver
            function nsResolver(prefix) {
                // Use custom 'ns' prefix for default namespace, retrieved in the XML document
                if (prefix === 'ns')
                    return dom.lookupNamespaceURI(null);
                return null;
            }
            const titleXPresult = dom.evaluate('/ns:WMS_Capabilities/ns:Service/ns:Title/text()', dom, nsResolver, XPathResult.STRING_TYPE, null);
            const title = titleXPresult.stringValue;
            // Find all layers
            const layersXPresult = dom.evaluate('//ns:Layer', dom, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            // Get layer info
            const layers = [];
            for (let i = 0; i < layersXPresult.snapshotLength; i++) {
                const item = layersXPresult.snapshotItem(i);
                if (!item)
                    continue;
                // Layer name
                const nameXPresult = dom.evaluate('ns:Name/text()', item, nsResolver, XPathResult.STRING_TYPE, null);
                if (!nameXPresult.stringValue) {
                    continue;
                }
                const name = nameXPresult.stringValue;
                // Layer title
                const titleXPresult = dom.evaluate('ns:Title/text()', item, nsResolver, XPathResult.STRING_TYPE, null);
                const title = titleXPresult.stringValue;
                // Is queryable?
                const queryableXPresult = dom.evaluate('@queryable', item, nsResolver, XPathResult.STRING_TYPE, null);
                const queryable = queryableXPresult.stringValue == '1';
                // Abstract
                const abstractXPresult = dom.evaluate('ns:Abstract/text()', item, nsResolver, XPathResult.STRING_TYPE, null);
                const abstract = abstractXPresult.stringValue;
                //CRS
                const crsXPresult = dom.evaluate('ns:CRS[text()]', item, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                const crsArray = [];
                for (let j = 0; j < crsXPresult.snapshotLength; j++) {
                    const crs = (_b = (_a = crsXPresult.snapshotItem(j)) === null || _a === void 0 ? void 0 : _a.firstChild) === null || _b === void 0 ? void 0 : _b.nodeValue;
                    if (!crs)
                        continue;
                    crsArray.push(crs);
                }
                // Create new layer
                layers.push(new Layer(name, title, queryable, abstract, crsArray));
            }
            // TODO get bounding box for each CRS
            // TODO get max image dimension
            // TODO max min resolution
            return new WMSService(baseURL, '1.3.0', // TODO get this value from Capabilities
            title, layers);
        });
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!******************************!*\
  !*** ./src/wmsClientTest.ts ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _WMSClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./WMSClient */ "./src/WMSClient.ts");

const mapImg = document.createElement('img');
// const client = new WMSClient('https://servizigis.regione.emilia-romagna.it/wms/geologia10k?request=GetCapabilities&service=WMS')
// const client = new WMSClient('https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystem_Map_service/MapServer/WMSServer')
const client = new _WMSClient__WEBPACK_IMPORTED_MODULE_0__.WMSClient();
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
    service.getMap('Unita_geologiche_10K', [611203, 4918338, 613791, 4920219], 'EPSG:32632', 1213, 881).then((mapURL) => {
        mapImg.src = mapURL;
        document.body.appendChild(mapImg);
        return service.getFeatureInfo('Unita_geologiche_10K', [611213, 4917943, 613781, 4920614], 'EPSG:32632', 847, 881, 418, 347);
    }).then((featureinfo) => {
        console.dir(featureinfo);
        const f = featureinfo;
        f.features.forEach((feat) => {
            const props = feat.properties;
            if (!props)
                return;
            for (const [key, value] of Object.entries(props)) {
                const newValue = addNewlines(value);
                console.log('<span class="featurepropname">' + key + ': </span>' + newValue);
            }
        });
    });
});
function addNewlines(str) {
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

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQyxHQUFHLFFBQVEsQ0FBQztRQUMxQyxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUN6QjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUM7QUFLRCwwR0FBMEc7QUFDMUcsNENBQTRDO0FBQzVDLGtHQUFrRztBQUNsRywySUFBMkkiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9nZW9sb2d5LXZyLy4vc3JjL1dNU0NsaWVudC50cyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2dlb2xvZ3ktdnIvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2dlb2xvZ3ktdnIvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL3NyYy93bXNDbGllbnRUZXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlxyXG5jbGFzcyBMYXllciB7XHJcbiAgICBuYW1lOiBzdHJpbmdcclxuICAgIHRpdGxlOiBzdHJpbmdcclxuICAgIHF1ZXJ5YWJsZTogYm9vbGVhblxyXG4gICAgYWJzdHJhY3Q6IHN0cmluZ1xyXG4gICAgQ1JTOiBzdHJpbmdbXVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG5hbWU6IHN0cmluZyxcclxuICAgICAgICB0aXRsZTogc3RyaW5nLFxyXG4gICAgICAgIHF1ZXJ5YWJsZTogYm9vbGVhbixcclxuICAgICAgICBhYnN0cmFjdDogc3RyaW5nLFxyXG4gICAgICAgIENSUzogc3RyaW5nW11cclxuICAgICkge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWVcclxuICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGVcclxuICAgICAgICB0aGlzLnF1ZXJ5YWJsZSA9IHF1ZXJ5YWJsZVxyXG4gICAgICAgIHRoaXMuYWJzdHJhY3QgPSBhYnN0cmFjdFxyXG4gICAgICAgIHRoaXMuQ1JTID0gQ1JTIHx8IFtdXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBXTVNTZXJ2aWNlIHtcclxuICAgIGJhc2VVUkw6IHN0cmluZ1xyXG4gICAgdmVyc2lvbjogc3RyaW5nXHJcbiAgICB0aXRsZTogc3RyaW5nXHJcbiAgICBsYXllcnM6IExheWVyW11cclxuICAgIC8vIFRPRE8gYWJzdHJhY3RcclxuICAgIC8vIFRPRE8gb25saW5lIHJlc291cmNlXHJcbiAgICAvLyBUT0RPIGNvbnRhY3QgaW5mb3JtYXRpb25cclxuICAgIC8vIFRPRE8gbGF5ZXIgbGltaXRcclxuICAgIC8vIFRPRE8gbWF4d2lkdGhcclxuICAgIC8vIFRPRE8gbWF4aGVpZ2h0XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgYmFzZVVSTDogc3RyaW5nLFxyXG4gICAgICAgIHZlcnNpb246IHN0cmluZyxcclxuICAgICAgICB0aXRsZTogc3RyaW5nLFxyXG4gICAgICAgIGxheWVyczogTGF5ZXJbXVxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5iYXNlVVJMID0gYmFzZVVSTFxyXG4gICAgICAgIHRoaXMudmVyc2lvbiA9IHZlcnNpb25cclxuICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGVcclxuICAgICAgICB0aGlzLmxheWVycyA9IGxheWVyc1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE8gYWxsb3cgbXVsdGlwbGUgbGF5ZXJzXHJcbiAgICBhc3luYyBnZXRNYXAoXHJcbiAgICAgICAgbGF5ZXJOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgYm91bmRpbmdCb3g6IG51bWJlcltdLFxyXG4gICAgICAgIENSUzogc3RyaW5nLFxyXG4gICAgICAgIHdpZHRoOiBudW1iZXIsXHJcbiAgICAgICAgaGVpZ2h0OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIC8vIENoZWNrIGlmIGxheWVyIGV4aXN0c1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gdGhpcy5sYXllcnMuZmluZCgobCkgPT4gbC5uYW1lID09IGxheWVyTmFtZSlcclxuICAgICAgICBpZiAoIWxheWVyKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xheWVyICcgKyBsYXllck5hbWUgKyAnIG5vdCBmb3VuZCBpbiBzZXJ2aWNlICcgKyB0aGlzLnRpdGxlKVxyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiBsYXllciBhY2NlcHRzIHRoaXMgQ1JTXHJcbiAgICAgICAgaWYgKCEobGF5ZXIuQ1JTLmluY2x1ZGVzKENSUykpKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xheWVyICcgKyBsYXllck5hbWUgKyAnIGRvZXMgbm90IGxpc3QgQ1JTICcgKyBDUlMpXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgYm91bmRpbmcgYm94IGlzIG91dCBvZiBDUlMgYm91bmRzXHJcbiAgICAgICAgLy8gVE9ETyB3cml0ZSBjb2RlIGhlcmVcclxuXHJcbiAgICAgICAgLy8gVE9ETyBjaGVjayBpcyBpbWFnZSBkaW1lbnNpb24gaXMgdG9vIGJpZ1xyXG4gICAgICAgIC8vIFRPRE8gY2hlY2sgaWYgcmVzb2x1dGlvbiBpcyBvdXQgb2YgYm91bmRzXHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBVUkxcclxuICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHRoaXMuYmFzZVVSTClcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnU0VSVklDRScsICdXTVMnKSAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1ZFUlNJT04nLCB0aGlzLnZlcnNpb24pICAgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnUkVRVUVTVCcsICdHZXRNYXAnKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdCQk9YJywgYm91bmRpbmdCb3guam9pbignLCcpKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdDUlMnLCBDUlMpICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1dJRFRIJywgd2lkdGgudG9GaXhlZCgwKSkgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnSEVJR0hUJywgaGVpZ2h0LnRvRml4ZWQoMCkpICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ0xBWUVSUycsIGxheWVyTmFtZSlcclxuICAgICAgICAvLyBUT0RPIGdldCBmcm9tIENhcGFiaWxpdGllcyBvcHRpb25zIGZvciBwYXJhbWV0ZXJzIGJlbG93XHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1NUWUxFUycsICcnKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdGT1JNQVQnLCAnaW1hZ2UvcG5nJylcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnRFBJJywgJzk2JylcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnTUFQX1JFU09MVVRJT04nLCAnOTYnKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdGT1JNQVRfT1BUSU9OUycsICdkcGk6OTYnKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdUUkFOU1BBUkVOVCcsICdUUlVFJylcclxuXHJcbiAgICAgICAgLy8gRmV0Y2ggVVJMXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcclxuICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYWNoZTogJ2ZvcmNlLWNhY2hlJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFJldHVybiBhIGxvY2FsIFVSTCBmb3IgdGhlIGRvd2xvYWRlZCBpbWFnZVxyXG4gICAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCByZXNwb25zZS5ibG9iKCk7XHJcbiAgICAgICAgY29uc3QgYmxvYlVSTCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XHJcbiAgICAgICAgcmV0dXJuIGJsb2JVUkxcclxuXHJcbiAgICAgICAgLy8gVE9ETyBjYXRjaCBlcnJvcnNcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPIGFsbG93IG11bHRpcGxlIGxheWVycywgYW5kL29yIGRpZmZlcmVudCBtYXAgbGF5ZXIgYW5kIHF1ZXJ5IGxheWVyXHJcbiAgICBhc3luYyBnZXRGZWF0dXJlSW5mbyhcclxuICAgICAgICBsYXllck5hbWU6IHN0cmluZywgICAgICAgIFxyXG4gICAgICAgIGJvdW5kaW5nQm94OiBudW1iZXJbXSxcclxuICAgICAgICBDUlM6IHN0cmluZyxcclxuICAgICAgICB3aWR0aDogbnVtYmVyLFxyXG4gICAgICAgIGhlaWdodDogbnVtYmVyLFxyXG4gICAgICAgIGk6IG51bWJlcixcclxuICAgICAgICBqOiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIC8vIENoZWNrIGlmIGxheWVyIGV4aXN0c1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gdGhpcy5sYXllcnMuZmluZCgobCkgPT4gbC5uYW1lID09IGxheWVyTmFtZSlcclxuICAgICAgICBpZiAoIWxheWVyKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xheWVyICcgKyBsYXllck5hbWUgKyAnIG5vdCBmb3VuZCBpbiBzZXJ2aWNlICcgKyB0aGlzLnRpdGxlKVxyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiBsYXllciBhY2NlcHRzIHRoaXMgQ1JTXHJcbiAgICAgICAgaWYgKCEobGF5ZXIuQ1JTLmluY2x1ZGVzKENSUykpKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xheWVyICcgKyBsYXllck5hbWUgKyAnIGRvZXMgbm90IGxpc3QgQ1JTICcgKyBDUlMpXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgbGF5ZXIgaXMgcXVlcnlhYmxlXHJcbiAgICAgICAgaWYgKCFsYXllci5xdWVyeWFibGUpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMYXllciAnICsgbGF5ZXJOYW1lICsgJyBpcyBub3QgcXVlcnlhYmxlJylcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgYm91bmRpbmcgYm94IGlzIG91dCBvZiBDUlMgYm91bmRzXHJcbiAgICAgICAgLy8gVE9ETyB3cml0ZSBjb2RlIGhlcmVcclxuXHJcbiAgICAgICAgLy8gVE9ETyBjaGVjayBpcyBpbWFnZSBkaW1lbnNpb24gaXMgdG9vIGJpZ1xyXG4gICAgICAgIC8vIFRPRE8gY2hlY2sgaWYgcmVzb2x1dGlvbiBpcyBvdXQgb2YgYm91bmRzXHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBVUkxcclxuICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHRoaXMuYmFzZVVSTClcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnU0VSVklDRScsICdXTVMnKSAgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnVkVSU0lPTicsIHRoaXMudmVyc2lvbikgICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1JFUVVFU1QnLCAnR2V0RmVhdHVyZUluZm8nKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdCQk9YJywgYm91bmRpbmdCb3guam9pbignLCcpKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdDUlMnLCBDUlMpICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1dJRFRIJywgd2lkdGgudG9GaXhlZCgwKSkgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnSEVJR0hUJywgaGVpZ2h0LnRvRml4ZWQoMCkpICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ0xBWUVSUycsIGxheWVyTmFtZSlcclxuICAgICAgICAvLyBUT0RPIGdldCBmcm9tIENhcGFiaWxpdGllcyBvcHRpb25zIGZvciBwYXJhbWV0ZXJzIGJlbG93XHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1NUWUxFUycsICcnKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdGT1JNQVQnLCAnaW1hZ2UvcG5nJylcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnUVVFUllfTEFZRVJTJywgbGF5ZXJOYW1lKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdJTkZPX0ZPUk1BVCcsICdhcHBsaWNhdGlvbi9nZW9qc29uJylcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnSScsIGkudG9GaXhlZCgwKSlcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnSicsIGoudG9GaXhlZCgwKSlcclxuXHJcbiAgICAgICAgLy8gRmV0Y2ggVVJMXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwpXHJcbiAgICAgICAgLy8gcmV0dXJuIHJlc3BvbnNlLnRleHQoKVxyXG4gICAgICAgIHJldHVybiByZXNwb25zZS5qc29uKCkgYXMgUHJvbWlzZTxHZW9KU09OLkdlb0pzb25PYmplY3Q+XHJcblxyXG4gICAgICAgIC8vIFRPRE8gY2F0Y2ggZXJyb3JzXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBXTVNDbGllbnQge1xyXG5cclxuICAgIGFzeW5jIGNvbm5lY3QodXJsOiBzdHJpbmcpIHtcclxuICAgICAgICAvLyBQYXJzZSBVUkwgcHJvdmlkZWRcclxuICAgICAgICBjb25zdCBiYXNlVVJMID0gdXJsLnNwbGl0KFwiP1wiKVswXSAgICAgICAgXHJcblxyXG4gICAgICAgIGNvbnN0IGdldENhcGFiaWxpdGllc1VSTCA9IG5ldyBVUkwoYmFzZVVSTClcclxuICAgICAgICBnZXRDYXBhYmlsaXRpZXNVUkwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnU0VSVklDRScsICdXTVMnKSAgICAgXHJcbiAgICAgICAgZ2V0Q2FwYWJpbGl0aWVzVVJMLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1JFUVVFU1QnLCAnR2V0Q2FwYWJpbGl0aWVzJylcclxuXHJcbiAgICAgICAgLy8gRmV0Y2ggVVJMIGFuZCBwYXJzZSByZXNwb25zZSBpbnRvIGEgRE9NXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChnZXRDYXBhYmlsaXRpZXNVUkwpXHJcbiAgICAgICAgY29uc3QgeG1sID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpXHJcbiAgICAgICAgY29uc3QgZG9tID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyh4bWwsICd0ZXh0L3htbCcpXHJcblxyXG4gICAgICAgIC8vIE5vdyBnZXQgaW5mbyBmcm9tIHJlc3BvbnNlIHVzaW5nIFhQYXRoXHJcblxyXG4gICAgICAgIC8vIEdldENhcGFiaWxpdGllcyBYTUwgZG9jdW1lbnQgc2hvdWxkIGhhdmUgYSBkZWZhdWx0IG5hbWVzcGFjZSBhbmQgbm8gcHJlZml4ZXMsXHJcbiAgICAgICAgLy8gc28gdGhlIG9ubHkgd2F5IEkgZm91bmQgdG8gbWFrZSBYUGF0aCB3b3JrcyBpcyB0aGlzIGN1c3RvbSBuYW1lc3BhY2UgcmVzb2x2ZXJcclxuICAgICAgICBmdW5jdGlvbiBuc1Jlc29sdmVyKHByZWZpeDogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIC8vIFVzZSBjdXN0b20gJ25zJyBwcmVmaXggZm9yIGRlZmF1bHQgbmFtZXNwYWNlLCByZXRyaWV2ZWQgaW4gdGhlIFhNTCBkb2N1bWVudFxyXG4gICAgICAgICAgICBpZiAocHJlZml4ID09PSAnbnMnKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvbS5sb29rdXBOYW1lc3BhY2VVUkkobnVsbClcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgdGl0bGVYUHJlc3VsdCA9IGRvbS5ldmFsdWF0ZShcclxuICAgICAgICAgICAgJy9uczpXTVNfQ2FwYWJpbGl0aWVzL25zOlNlcnZpY2UvbnM6VGl0bGUvdGV4dCgpJyxcclxuICAgICAgICAgICAgZG9tLFxyXG4gICAgICAgICAgICBuc1Jlc29sdmVyLFxyXG4gICAgICAgICAgICBYUGF0aFJlc3VsdC5TVFJJTkdfVFlQRSxcclxuICAgICAgICAgICAgbnVsbFxyXG4gICAgICAgIClcclxuICAgICAgICBjb25zdCB0aXRsZSA9IHRpdGxlWFByZXN1bHQuc3RyaW5nVmFsdWVcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvLyBGaW5kIGFsbCBsYXllcnNcclxuICAgICAgICBjb25zdCBsYXllcnNYUHJlc3VsdCA9IGRvbS5ldmFsdWF0ZShcclxuICAgICAgICAgICAgJy8vbnM6TGF5ZXInLFxyXG4gICAgICAgICAgICBkb20sXHJcbiAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgIFhQYXRoUmVzdWx0Lk9SREVSRURfTk9ERV9TTkFQU0hPVF9UWVBFLFxyXG4gICAgICAgICAgICBudWxsXHJcbiAgICAgICAgKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEdldCBsYXllciBpbmZvXHJcbiAgICAgICAgY29uc3QgbGF5ZXJzIDogTGF5ZXJbXSA9IFtdXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYXllcnNYUHJlc3VsdC5zbmFwc2hvdExlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBsYXllcnNYUHJlc3VsdC5zbmFwc2hvdEl0ZW0oaSlcclxuXHJcbiAgICAgICAgICAgIGlmICghaXRlbSlcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgLy8gTGF5ZXIgbmFtZVxyXG4gICAgICAgICAgICBjb25zdCBuYW1lWFByZXN1bHQgPSBkb20uZXZhbHVhdGUoXHJcbiAgICAgICAgICAgICAgICAnbnM6TmFtZS90ZXh0KCknLFxyXG4gICAgICAgICAgICAgICAgaXRlbSxcclxuICAgICAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgICAgICBYUGF0aFJlc3VsdC5TVFJJTkdfVFlQRSxcclxuICAgICAgICAgICAgICAgIG51bGxcclxuICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuYW1lWFByZXN1bHQuc3RyaW5nVmFsdWUpe1xyXG4gICAgICAgICAgICAgICAgY29udGludWVcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgbmFtZSA9IG5hbWVYUHJlc3VsdC5zdHJpbmdWYWx1ZVxyXG5cclxuICAgICAgICAgICAgLy8gTGF5ZXIgdGl0bGVcclxuICAgICAgICAgICAgY29uc3QgdGl0bGVYUHJlc3VsdCA9IGRvbS5ldmFsdWF0ZShcclxuICAgICAgICAgICAgICAgICduczpUaXRsZS90ZXh0KCknLFxyXG4gICAgICAgICAgICAgICAgaXRlbSxcclxuICAgICAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgICAgICBYUGF0aFJlc3VsdC5TVFJJTkdfVFlQRSxcclxuICAgICAgICAgICAgICAgIG51bGxcclxuICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICAgICAgY29uc3QgdGl0bGUgPSB0aXRsZVhQcmVzdWx0LnN0cmluZ1ZhbHVlXHJcblxyXG4gICAgICAgICAgICAvLyBJcyBxdWVyeWFibGU/XHJcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5YWJsZVhQcmVzdWx0ID0gZG9tLmV2YWx1YXRlKFxyXG4gICAgICAgICAgICAgICAgJ0BxdWVyeWFibGUnLFxyXG4gICAgICAgICAgICAgICAgaXRlbSxcclxuICAgICAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgICAgICBYUGF0aFJlc3VsdC5TVFJJTkdfVFlQRSxcclxuICAgICAgICAgICAgICAgIG51bGxcclxuICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcXVlcnlhYmxlID0gcXVlcnlhYmxlWFByZXN1bHQuc3RyaW5nVmFsdWUgPT0gJzEnXHJcblxyXG4gICAgICAgICAgICAvLyBBYnN0cmFjdFxyXG4gICAgICAgICAgICBjb25zdCBhYnN0cmFjdFhQcmVzdWx0ID0gZG9tLmV2YWx1YXRlKFxyXG4gICAgICAgICAgICAgICAgJ25zOkFic3RyYWN0L3RleHQoKScsXHJcbiAgICAgICAgICAgICAgICBpdGVtLFxyXG4gICAgICAgICAgICAgICAgbnNSZXNvbHZlcixcclxuICAgICAgICAgICAgICAgIFhQYXRoUmVzdWx0LlNUUklOR19UWVBFLFxyXG4gICAgICAgICAgICAgICAgbnVsbFxyXG4gICAgICAgICAgICApXHJcblxyXG4gICAgICAgICAgICBjb25zdCBhYnN0cmFjdCA9IGFic3RyYWN0WFByZXN1bHQuc3RyaW5nVmFsdWVcclxuXHJcbiAgICAgICAgICAgIC8vQ1JTXHJcbiAgICAgICAgICAgIGNvbnN0IGNyc1hQcmVzdWx0ID0gZG9tLmV2YWx1YXRlKFxyXG4gICAgICAgICAgICAgICAgJ25zOkNSU1t0ZXh0KCldJyxcclxuICAgICAgICAgICAgICAgIGl0ZW0sXHJcbiAgICAgICAgICAgICAgICBuc1Jlc29sdmVyLFxyXG4gICAgICAgICAgICAgICAgWFBhdGhSZXN1bHQuT1JERVJFRF9OT0RFX1NOQVBTSE9UX1RZUEUsXHJcbiAgICAgICAgICAgICAgICBudWxsXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgY29uc3QgY3JzQXJyYXkgOiBzdHJpbmdbXSA9IFtdXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgY3JzWFByZXN1bHQuc25hcHNob3RMZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY3JzID0gY3JzWFByZXN1bHQuc25hcHNob3RJdGVtKGopPy5maXJzdENoaWxkPy5ub2RlVmFsdWVcclxuICAgICAgICAgICAgICAgIGlmICghY3JzKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGNyc0FycmF5LnB1c2goY3JzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgbmV3IGxheWVyXHJcbiAgICAgICAgICAgIGxheWVycy5wdXNoKG5ldyBMYXllcihuYW1lLCB0aXRsZSwgcXVlcnlhYmxlLCBhYnN0cmFjdCwgY3JzQXJyYXkpKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVE9ETyBnZXQgYm91bmRpbmcgYm94IGZvciBlYWNoIENSU1xyXG4gICAgICAgIC8vIFRPRE8gZ2V0IG1heCBpbWFnZSBkaW1lbnNpb25cclxuICAgICAgICAvLyBUT0RPIG1heCBtaW4gcmVzb2x1dGlvblxyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFdNU1NlcnZpY2UoXHJcbiAgICAgICAgICAgIGJhc2VVUkwsXHJcbiAgICAgICAgICAgICcxLjMuMCcsIC8vIFRPRE8gZ2V0IHRoaXMgdmFsdWUgZnJvbSBDYXBhYmlsaXRpZXNcclxuICAgICAgICAgICAgdGl0bGUsXHJcbiAgICAgICAgICAgIGxheWVyc1xyXG4gICAgICAgICkgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBGZWF0dXJlQ29sbGVjdGlvbiB9IGZyb20gXCJnZW9qc29uXCI7XHJcbmltcG9ydCB7IFdNU0NsaWVudCB9IGZyb20gXCIuL1dNU0NsaWVudFwiO1xyXG5cclxuY29uc3QgbWFwSW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJylcclxuLy8gY29uc3QgY2xpZW50ID0gbmV3IFdNU0NsaWVudCgnaHR0cHM6Ly9zZXJ2aXppZ2lzLnJlZ2lvbmUuZW1pbGlhLXJvbWFnbmEuaXQvd21zL2dlb2xvZ2lhMTBrP3JlcXVlc3Q9R2V0Q2FwYWJpbGl0aWVzJnNlcnZpY2U9V01TJylcclxuLy8gY29uc3QgY2xpZW50ID0gbmV3IFdNU0NsaWVudCgnaHR0cHM6Ly9iaW8uZGlzY29tYXAuZWVhLmV1cm9wYS5ldS9hcmNnaXMvc2VydmljZXMvRWNvc3lzdGVtL0Vjb3N5c3RlbV9NYXBfc2VydmljZS9NYXBTZXJ2ZXIvV01TU2VydmVyJylcclxuXHJcbmNvbnN0IGNsaWVudCA9IG5ldyBXTVNDbGllbnQoKVxyXG5cclxuLy8gaHR0cDovL3NlcnZpemlnaXMucmVnaW9uZS5lbWlsaWEtcm9tYWduYS5pdC93bXMvZ2VvbG9naWExMGs/XHJcbi8vU0VSVklDRT1XTVMmVkVSU0lPTj0xLjMuMCZSRVFVRVNUPUdldE1hcCZcclxuLy8gQkJPWD02MTEyMDMuODU4ODgyMTE5ODc5MSUyQzQ5MTgzMzguODg5OTcxMTcyNDM3JTJDNjEzNzkxLjU2MDc3OTcyNjEzMjglMkM0OTIwMjE5Ljg4NDUwMjM1MzE0NyZcclxuLy8gQ1JTPUVQU0clM0EzMjYzMiZXSURUSD0xMjEzJkhFSUdIVD04ODEmTEFZRVJTPVVuaXRhX2dlb2xvZ2ljaGVfMTBLJlxyXG4vLyBTVFlMRVM9JkZPUk1BVD1pbWFnZSUyRnBuZyZEUEk9OTYmTUFQX1JFU09MVVRJT049OTYmRk9STUFUX09QVElPTlM9ZHBpJTNBOTYmVFJBTlNQQVJFTlQ9VFJVRVxyXG5cclxuLy8gaHR0cDovL3NlcnZpemlnaXMucmVnaW9uZS5lbWlsaWEtcm9tYWduYS5pdC93bXMvZ2VvbG9naWExMGs/XHJcbi8vIFNFUlZJQ0U9V01TJlZFUlNJT049MS4zLjAmUkVRVUVTVD1HZXRGZWF0dXJlSW5mbyZcclxuLy8gQkJPWD02MTEyMTMuNzgwNDM4MTk4MzU4NzUxODMlMkM0OTE3OTQzLjkxODc2NTY5OTQ5MDkwNDgxJTJDNjEzNzgxLjYzOTIyMzY0NzY1MzEyNTIzJTJDNDkyMDYxNC44NTU3MDc4MjYwOTI4MzkyNCZcclxuLy8gQ1JTPUVQU0clM0EzMjYzMlxyXG4vLyAmV0lEVEg9ODQ3XHJcbi8vICZIRUlHSFQ9ODgxJlxyXG4vLyBMQVlFUlM9VW5pdGFfZ2VvbG9naWNoZV8xMEtcclxuLy8gJlNUWUxFUz0mRk9STUFUPWltYWdlJTJGcG5nJlFVRVJZX0xBWUVSUz1Vbml0YV9nZW9sb2dpY2hlXzEwSyZJTkZPX0ZPUk1BVD10ZXh0JTJGaHRtbCZJPTQxOCZKPTM0N1xyXG5cclxuY2xpZW50LmNvbm5lY3QoJ2h0dHBzOi8vc2Vydml6aWdpcy5yZWdpb25lLmVtaWxpYS1yb21hZ25hLml0L3dtcy9nZW9sb2dpYTEwaycpLnRoZW4oKHNlcnZpY2UpID0+IHtcclxuICAgIHNlcnZpY2UuZ2V0TWFwKFxyXG4gICAgICAgICdVbml0YV9nZW9sb2dpY2hlXzEwSycsXHJcbiAgICAgICAgWzYxMTIwMywgNDkxODMzOCwgNjEzNzkxLCA0OTIwMjE5XSxcclxuICAgICAgICAnRVBTRzozMjYzMicsXHJcbiAgICAgICAgMTIxMyxcclxuICAgICAgICA4ODFcclxuICAgICkudGhlbigobWFwVVJMKSA9PiB7XHJcbiAgICAgICAgbWFwSW1nLnNyYyA9IG1hcFVSTFxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWFwSW1nKVxyXG4gICAgICAgIHJldHVybiBzZXJ2aWNlLmdldEZlYXR1cmVJbmZvKFxyXG4gICAgICAgICAgICAnVW5pdGFfZ2VvbG9naWNoZV8xMEsnLFxyXG4gICAgICAgICAgICBbNjExMjEzLCA0OTE3OTQzLCA2MTM3ODEsIDQ5MjA2MTRdLFxyXG4gICAgICAgICAgICAnRVBTRzozMjYzMicsXHJcbiAgICAgICAgICAgIDg0NyxcclxuICAgICAgICAgICAgODgxLFxyXG4gICAgICAgICAgICA0MTgsXHJcbiAgICAgICAgICAgIDM0N1xyXG4gICAgICAgIClcclxuICAgIH0pLnRoZW4oKGZlYXR1cmVpbmZvKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5kaXIoZmVhdHVyZWluZm8pXHJcblxyXG4gICAgICAgIGNvbnN0IGYgPSBmZWF0dXJlaW5mbyBhcyBGZWF0dXJlQ29sbGVjdGlvblxyXG4gICAgICAgIGYuZmVhdHVyZXMuZm9yRWFjaCgoZmVhdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBwcm9wcyA9IGZlYXQucHJvcGVydGllc1xyXG5cclxuICAgICAgICAgICAgaWYgKCFwcm9wcykgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocHJvcHMpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBhZGROZXdsaW5lcyh2YWx1ZSlcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCc8c3BhbiBjbGFzcz1cImZlYXR1cmVwcm9wbmFtZVwiPicgKyBrZXkgKyAnOiA8L3NwYW4+JyArIG5ld1ZhbHVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH0pXHJcbn0pXHJcblxyXG5mdW5jdGlvbiBhZGROZXdsaW5lcyhzdHI6IHN0cmluZykge1xyXG4gIHZhciByZXN1bHQgPSAnJztcclxuICB3aGlsZSAoc3RyLmxlbmd0aCA+IDApIHtcclxuICAgIHJlc3VsdCArPSBzdHIuc3Vic3RyaW5nKDAsIDgwKSArICc8YnIgLz4nO1xyXG4gICAgc3RyID0gc3RyLnN1YnN0cmluZyg4MCk7XHJcbiAgfVxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcblxyXG5cclxuXHJcbi8vIGh0dHBzOi8vYmlvLmRpc2NvbWFwLmVlYS5ldXJvcGEuZXUvYXJjZ2lzL3NlcnZpY2VzL0Vjb3N5c3RlbS9FY29zeXN0ZW1fTWFwX3NlcnZpY2UvTWFwU2VydmVyL1dNU1NlcnZlcj9cclxuLy8gU0VSVklDRT1XTVMmVkVSU0lPTj0xLjMuMCZSRVFVRVNUPUdldE1hcCZcclxuLy8gQkJPWD0xMC4zODIwODIyNDQ2NzczOTg4MiUyQzQ0LjM5Njk3MTU5NTM2NTYyMDU0JTJDMTAuNDQ1NzkzNDM5MTQ2NjM5MTYlMkM0NC40MzM5MjMxNTk3MzU2NjI5OCZcclxuLy8gQ1JTPUNSUyUzQTg0JldJRFRIPTEzNTImSEVJR0hUPTc4NCZMQVlFUlM9MiZTVFlMRVM9JkZPUk1BVD1pbWFnZSUyRnBuZyZEUEk9OTYmTUFQX1JFU09MVVRJT049OTYmRk9STUFUX09QVElPTlM9ZHBpJTNBOTYmVFJBTlNQQVJFTlQ9VFJVRSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==