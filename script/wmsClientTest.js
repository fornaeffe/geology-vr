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
            url.searchParams.append('INFO_FORMAT', 'text/html');
            url.searchParams.append('I', i.toFixed(0));
            url.searchParams.append('J', j.toFixed(0));
            // Fetch URL
            const response = yield fetch(url);
            return response.text();
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
                    console.log('Layer without name');
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
client.connect('https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystem_Map_service/MapServer/WMSServer').then((service) => {
    service.getMap('2', [10.38208224, 44.39697159, 10.445793439, 44.433923159], 'CRS:84', 1352, 784).then((mapURL) => {
        mapImg.src = mapURL;
        document.body.appendChild(mapImg);
        return service.getFeatureInfo('2', [10.403135325028, 44.41458669139024, 10.4032404590122, 44.41466178799623], 'CRS:84', 2, 2, 0, 1);
    }).then((responseHTML) => {
        const doc = new DOMParser().parseFromString(responseHTML, 'text/html');
        const children = doc.children;
        for (let i = 0; i < children.length; i++) {
            const item = children.item(i);
            if (!item)
                continue;
            document.body.append(item);
        }
    });
});
// https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystem_Map_service/MapServer/WMSServer?
// SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&
// BBOX=10.38208224467739882%2C44.39697159536562054%2C10.44579343914663916%2C44.43392315973566298&
// CRS=CRS%3A84&WIDTH=1352&HEIGHT=784&LAYERS=2&STYLES=&FORMAT=image%2Fpng&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi%3A96&TRANSPARENT=TRUE

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDLGNBQWMsQ0FDekIsR0FBRyxFQUNILENBQUMsZUFBZSxFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLGlCQUFpQixDQUFDLEVBQ3pFLFFBQVEsRUFDUixDQUFDLEVBQ0QsQ0FBQyxFQUNELENBQUMsRUFDRCxDQUFDLENBQ0o7SUFDTCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBRTtRQUNyQixNQUFNLEdBQUcsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsV0FBVyxDQUFDO1FBQ3RFLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxRQUFRO1FBQzdCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3RDLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxJQUFJO2dCQUNMLFNBQVM7WUFFYixRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7U0FDN0I7SUFDTCxDQUFDLENBQUM7QUFDTixDQUFDLENBQUM7QUFPRiwwR0FBMEc7QUFDMUcsNENBQTRDO0FBQzVDLGtHQUFrRztBQUNsRywySUFBMkkiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9nZW9sb2d5LXZyLy4vc3JjL1dNU0NsaWVudC50cyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2dlb2xvZ3ktdnIvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2dlb2xvZ3ktdnIvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL3NyYy93bXNDbGllbnRUZXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIlxyXG5jbGFzcyBMYXllciB7XHJcbiAgICBuYW1lOiBzdHJpbmdcclxuICAgIHRpdGxlOiBzdHJpbmdcclxuICAgIHF1ZXJ5YWJsZTogYm9vbGVhblxyXG4gICAgYWJzdHJhY3Q6IHN0cmluZ1xyXG4gICAgQ1JTOiBzdHJpbmdbXVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG5hbWU6IHN0cmluZyxcclxuICAgICAgICB0aXRsZTogc3RyaW5nLFxyXG4gICAgICAgIHF1ZXJ5YWJsZTogYm9vbGVhbixcclxuICAgICAgICBhYnN0cmFjdDogc3RyaW5nLFxyXG4gICAgICAgIENSUzogc3RyaW5nW11cclxuICAgICkge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWVcclxuICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGVcclxuICAgICAgICB0aGlzLnF1ZXJ5YWJsZSA9IHF1ZXJ5YWJsZVxyXG4gICAgICAgIHRoaXMuYWJzdHJhY3QgPSBhYnN0cmFjdFxyXG4gICAgICAgIHRoaXMuQ1JTID0gQ1JTIHx8IFtdXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBXTVNTZXJ2aWNlIHtcclxuICAgIGJhc2VVUkw6IHN0cmluZ1xyXG4gICAgdmVyc2lvbjogc3RyaW5nXHJcbiAgICB0aXRsZTogc3RyaW5nXHJcbiAgICBsYXllcnM6IExheWVyW11cclxuICAgIC8vIFRPRE8gYWJzdHJhY3RcclxuICAgIC8vIFRPRE8gb25saW5lIHJlc291cmNlXHJcbiAgICAvLyBUT0RPIGNvbnRhY3QgaW5mb3JtYXRpb25cclxuICAgIC8vIFRPRE8gbGF5ZXIgbGltaXRcclxuICAgIC8vIFRPRE8gbWF4d2lkdGhcclxuICAgIC8vIFRPRE8gbWF4aGVpZ2h0XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgYmFzZVVSTDogc3RyaW5nLFxyXG4gICAgICAgIHZlcnNpb246IHN0cmluZyxcclxuICAgICAgICB0aXRsZTogc3RyaW5nLFxyXG4gICAgICAgIGxheWVyczogTGF5ZXJbXVxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5iYXNlVVJMID0gYmFzZVVSTFxyXG4gICAgICAgIHRoaXMudmVyc2lvbiA9IHZlcnNpb25cclxuICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGVcclxuICAgICAgICB0aGlzLmxheWVycyA9IGxheWVyc1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE8gYWxsb3cgbXVsdGlwbGUgbGF5ZXJzXHJcbiAgICBhc3luYyBnZXRNYXAoXHJcbiAgICAgICAgbGF5ZXJOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgYm91bmRpbmdCb3g6IG51bWJlcltdLFxyXG4gICAgICAgIENSUzogc3RyaW5nLFxyXG4gICAgICAgIHdpZHRoOiBudW1iZXIsXHJcbiAgICAgICAgaGVpZ2h0OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIC8vIENoZWNrIGlmIGxheWVyIGV4aXN0c1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gdGhpcy5sYXllcnMuZmluZCgobCkgPT4gbC5uYW1lID09IGxheWVyTmFtZSlcclxuICAgICAgICBpZiAoIWxheWVyKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xheWVyICcgKyBsYXllck5hbWUgKyAnIG5vdCBmb3VuZCBpbiBzZXJ2aWNlICcgKyB0aGlzLnRpdGxlKVxyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiBsYXllciBhY2NlcHRzIHRoaXMgQ1JTXHJcbiAgICAgICAgaWYgKCEobGF5ZXIuQ1JTLmluY2x1ZGVzKENSUykpKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xheWVyICcgKyBsYXllck5hbWUgKyAnIGRvZXMgbm90IGxpc3QgQ1JTICcgKyBDUlMpXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgYm91bmRpbmcgYm94IGlzIG91dCBvZiBDUlMgYm91bmRzXHJcbiAgICAgICAgLy8gVE9ETyB3cml0ZSBjb2RlIGhlcmVcclxuXHJcbiAgICAgICAgLy8gVE9ETyBjaGVjayBpcyBpbWFnZSBkaW1lbnNpb24gaXMgdG9vIGJpZ1xyXG4gICAgICAgIC8vIFRPRE8gY2hlY2sgaWYgcmVzb2x1dGlvbiBpcyBvdXQgb2YgYm91bmRzXHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBVUkxcclxuICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHRoaXMuYmFzZVVSTClcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnU0VSVklDRScsICdXTVMnKSAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1ZFUlNJT04nLCB0aGlzLnZlcnNpb24pICAgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnUkVRVUVTVCcsICdHZXRNYXAnKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdCQk9YJywgYm91bmRpbmdCb3guam9pbignLCcpKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdDUlMnLCBDUlMpICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1dJRFRIJywgd2lkdGgudG9GaXhlZCgwKSkgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnSEVJR0hUJywgaGVpZ2h0LnRvRml4ZWQoMCkpICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ0xBWUVSUycsIGxheWVyTmFtZSlcclxuICAgICAgICAvLyBUT0RPIGdldCBmcm9tIENhcGFiaWxpdGllcyBvcHRpb25zIGZvciBwYXJhbWV0ZXJzIGJlbG93XHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1NUWUxFUycsICcnKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdGT1JNQVQnLCAnaW1hZ2UvcG5nJylcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnRFBJJywgJzk2JylcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnTUFQX1JFU09MVVRJT04nLCAnOTYnKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdGT1JNQVRfT1BUSU9OUycsICdkcGk6OTYnKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdUUkFOU1BBUkVOVCcsICdUUlVFJylcclxuXHJcbiAgICAgICAgLy8gRmV0Y2ggVVJMXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcclxuICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYWNoZTogJ2ZvcmNlLWNhY2hlJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFJldHVybiBhIGxvY2FsIFVSTCBmb3IgdGhlIGRvd2xvYWRlZCBpbWFnZVxyXG4gICAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCByZXNwb25zZS5ibG9iKCk7XHJcbiAgICAgICAgY29uc3QgYmxvYlVSTCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XHJcbiAgICAgICAgcmV0dXJuIGJsb2JVUkxcclxuXHJcbiAgICAgICAgLy8gVE9ETyBjYXRjaCBlcnJvcnNcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPIGFsbG93IG11bHRpcGxlIGxheWVycywgYW5kL29yIGRpZmZlcmVudCBtYXAgbGF5ZXIgYW5kIHF1ZXJ5IGxheWVyXHJcbiAgICBhc3luYyBnZXRGZWF0dXJlSW5mbyhcclxuICAgICAgICBsYXllck5hbWU6IHN0cmluZywgICAgICAgIFxyXG4gICAgICAgIGJvdW5kaW5nQm94OiBudW1iZXJbXSxcclxuICAgICAgICBDUlM6IHN0cmluZyxcclxuICAgICAgICB3aWR0aDogbnVtYmVyLFxyXG4gICAgICAgIGhlaWdodDogbnVtYmVyLFxyXG4gICAgICAgIGk6IG51bWJlcixcclxuICAgICAgICBqOiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIC8vIENoZWNrIGlmIGxheWVyIGV4aXN0c1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gdGhpcy5sYXllcnMuZmluZCgobCkgPT4gbC5uYW1lID09IGxheWVyTmFtZSlcclxuICAgICAgICBpZiAoIWxheWVyKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xheWVyICcgKyBsYXllck5hbWUgKyAnIG5vdCBmb3VuZCBpbiBzZXJ2aWNlICcgKyB0aGlzLnRpdGxlKVxyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiBsYXllciBhY2NlcHRzIHRoaXMgQ1JTXHJcbiAgICAgICAgaWYgKCEobGF5ZXIuQ1JTLmluY2x1ZGVzKENSUykpKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xheWVyICcgKyBsYXllck5hbWUgKyAnIGRvZXMgbm90IGxpc3QgQ1JTICcgKyBDUlMpXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgbGF5ZXIgaXMgcXVlcnlhYmxlXHJcbiAgICAgICAgaWYgKCFsYXllci5xdWVyeWFibGUpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMYXllciAnICsgbGF5ZXJOYW1lICsgJyBpcyBub3QgcXVlcnlhYmxlJylcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgYm91bmRpbmcgYm94IGlzIG91dCBvZiBDUlMgYm91bmRzXHJcbiAgICAgICAgLy8gVE9ETyB3cml0ZSBjb2RlIGhlcmVcclxuXHJcbiAgICAgICAgLy8gVE9ETyBjaGVjayBpcyBpbWFnZSBkaW1lbnNpb24gaXMgdG9vIGJpZ1xyXG4gICAgICAgIC8vIFRPRE8gY2hlY2sgaWYgcmVzb2x1dGlvbiBpcyBvdXQgb2YgYm91bmRzXHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBVUkxcclxuICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHRoaXMuYmFzZVVSTClcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnU0VSVklDRScsICdXTVMnKSAgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnVkVSU0lPTicsIHRoaXMudmVyc2lvbikgICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1JFUVVFU1QnLCAnR2V0RmVhdHVyZUluZm8nKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdCQk9YJywgYm91bmRpbmdCb3guam9pbignLCcpKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdDUlMnLCBDUlMpICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1dJRFRIJywgd2lkdGgudG9GaXhlZCgwKSkgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnSEVJR0hUJywgaGVpZ2h0LnRvRml4ZWQoMCkpICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ0xBWUVSUycsIGxheWVyTmFtZSlcclxuICAgICAgICAvLyBUT0RPIGdldCBmcm9tIENhcGFiaWxpdGllcyBvcHRpb25zIGZvciBwYXJhbWV0ZXJzIGJlbG93XHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1NUWUxFUycsICcnKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdGT1JNQVQnLCAnaW1hZ2UvcG5nJylcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnUVVFUllfTEFZRVJTJywgbGF5ZXJOYW1lKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdJTkZPX0ZPUk1BVCcsICd0ZXh0L2h0bWwnKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdJJywgaS50b0ZpeGVkKDApKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdKJywgai50b0ZpeGVkKDApKVxyXG5cclxuICAgICAgICAvLyBGZXRjaCBVUkxcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybClcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpXHJcblxyXG4gICAgICAgIC8vIFRPRE8gY2F0Y2ggZXJyb3JzXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBXTVNDbGllbnQge1xyXG5cclxuICAgIGFzeW5jIGNvbm5lY3QodXJsOiBzdHJpbmcpIHtcclxuICAgICAgICAvLyBQYXJzZSBVUkwgcHJvdmlkZWRcclxuICAgICAgICBjb25zdCBiYXNlVVJMID0gdXJsLnNwbGl0KFwiP1wiKVswXSAgICAgICAgXHJcblxyXG4gICAgICAgIGNvbnN0IGdldENhcGFiaWxpdGllc1VSTCA9IG5ldyBVUkwoYmFzZVVSTClcclxuICAgICAgICBnZXRDYXBhYmlsaXRpZXNVUkwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnU0VSVklDRScsICdXTVMnKSAgICAgXHJcbiAgICAgICAgZ2V0Q2FwYWJpbGl0aWVzVVJMLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1JFUVVFU1QnLCAnR2V0Q2FwYWJpbGl0aWVzJylcclxuXHJcbiAgICAgICAgLy8gRmV0Y2ggVVJMIGFuZCBwYXJzZSByZXNwb25zZSBpbnRvIGEgRE9NXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChnZXRDYXBhYmlsaXRpZXNVUkwpXHJcbiAgICAgICAgY29uc3QgeG1sID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpXHJcbiAgICAgICAgY29uc3QgZG9tID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyh4bWwsICd0ZXh0L3htbCcpXHJcblxyXG4gICAgICAgIC8vIE5vdyBnZXQgaW5mbyBmcm9tIHJlc3BvbnNlIHVzaW5nIFhQYXRoXHJcblxyXG4gICAgICAgIC8vIEdldENhcGFiaWxpdGllcyBYTUwgZG9jdW1lbnQgc2hvdWxkIGhhdmUgYSBkZWZhdWx0IG5hbWVzcGFjZSBhbmQgbm8gcHJlZml4ZXMsXHJcbiAgICAgICAgLy8gc28gdGhlIG9ubHkgd2F5IEkgZm91bmQgdG8gbWFrZSBYUGF0aCB3b3JrcyBpcyB0aGlzIGN1c3RvbSBuYW1lc3BhY2UgcmVzb2x2ZXJcclxuICAgICAgICBmdW5jdGlvbiBuc1Jlc29sdmVyKHByZWZpeDogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIC8vIFVzZSBjdXN0b20gJ25zJyBwcmVmaXggZm9yIGRlZmF1bHQgbmFtZXNwYWNlLCByZXRyaWV2ZWQgaW4gdGhlIFhNTCBkb2N1bWVudFxyXG4gICAgICAgICAgICBpZiAocHJlZml4ID09PSAnbnMnKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvbS5sb29rdXBOYW1lc3BhY2VVUkkobnVsbClcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgdGl0bGVYUHJlc3VsdCA9IGRvbS5ldmFsdWF0ZShcclxuICAgICAgICAgICAgJy9uczpXTVNfQ2FwYWJpbGl0aWVzL25zOlNlcnZpY2UvbnM6VGl0bGUvdGV4dCgpJyxcclxuICAgICAgICAgICAgZG9tLFxyXG4gICAgICAgICAgICBuc1Jlc29sdmVyLFxyXG4gICAgICAgICAgICBYUGF0aFJlc3VsdC5TVFJJTkdfVFlQRSxcclxuICAgICAgICAgICAgbnVsbFxyXG4gICAgICAgIClcclxuICAgICAgICBjb25zdCB0aXRsZSA9IHRpdGxlWFByZXN1bHQuc3RyaW5nVmFsdWVcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvLyBGaW5kIGFsbCBsYXllcnNcclxuICAgICAgICBjb25zdCBsYXllcnNYUHJlc3VsdCA9IGRvbS5ldmFsdWF0ZShcclxuICAgICAgICAgICAgJy8vbnM6TGF5ZXInLFxyXG4gICAgICAgICAgICBkb20sXHJcbiAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgIFhQYXRoUmVzdWx0Lk9SREVSRURfTk9ERV9TTkFQU0hPVF9UWVBFLFxyXG4gICAgICAgICAgICBudWxsXHJcbiAgICAgICAgKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEdldCBsYXllciBpbmZvXHJcbiAgICAgICAgY29uc3QgbGF5ZXJzIDogTGF5ZXJbXSA9IFtdXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYXllcnNYUHJlc3VsdC5zbmFwc2hvdExlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBsYXllcnNYUHJlc3VsdC5zbmFwc2hvdEl0ZW0oaSlcclxuXHJcbiAgICAgICAgICAgIGlmICghaXRlbSlcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgLy8gTGF5ZXIgbmFtZVxyXG4gICAgICAgICAgICBjb25zdCBuYW1lWFByZXN1bHQgPSBkb20uZXZhbHVhdGUoXHJcbiAgICAgICAgICAgICAgICAnbnM6TmFtZS90ZXh0KCknLFxyXG4gICAgICAgICAgICAgICAgaXRlbSxcclxuICAgICAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgICAgICBYUGF0aFJlc3VsdC5TVFJJTkdfVFlQRSxcclxuICAgICAgICAgICAgICAgIG51bGxcclxuICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuYW1lWFByZXN1bHQuc3RyaW5nVmFsdWUpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0xheWVyIHdpdGhvdXQgbmFtZScpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBuYW1lID0gbmFtZVhQcmVzdWx0LnN0cmluZ1ZhbHVlXHJcblxyXG4gICAgICAgICAgICAvLyBMYXllciB0aXRsZVxyXG4gICAgICAgICAgICBjb25zdCB0aXRsZVhQcmVzdWx0ID0gZG9tLmV2YWx1YXRlKFxyXG4gICAgICAgICAgICAgICAgJ25zOlRpdGxlL3RleHQoKScsXHJcbiAgICAgICAgICAgICAgICBpdGVtLFxyXG4gICAgICAgICAgICAgICAgbnNSZXNvbHZlcixcclxuICAgICAgICAgICAgICAgIFhQYXRoUmVzdWx0LlNUUklOR19UWVBFLFxyXG4gICAgICAgICAgICAgICAgbnVsbFxyXG4gICAgICAgICAgICApXHJcblxyXG4gICAgICAgICAgICBjb25zdCB0aXRsZSA9IHRpdGxlWFByZXN1bHQuc3RyaW5nVmFsdWVcclxuXHJcbiAgICAgICAgICAgIC8vIElzIHF1ZXJ5YWJsZT9cclxuICAgICAgICAgICAgY29uc3QgcXVlcnlhYmxlWFByZXN1bHQgPSBkb20uZXZhbHVhdGUoXHJcbiAgICAgICAgICAgICAgICAnQHF1ZXJ5YWJsZScsXHJcbiAgICAgICAgICAgICAgICBpdGVtLFxyXG4gICAgICAgICAgICAgICAgbnNSZXNvbHZlcixcclxuICAgICAgICAgICAgICAgIFhQYXRoUmVzdWx0LlNUUklOR19UWVBFLFxyXG4gICAgICAgICAgICAgICAgbnVsbFxyXG4gICAgICAgICAgICApXHJcblxyXG4gICAgICAgICAgICBjb25zdCBxdWVyeWFibGUgPSBxdWVyeWFibGVYUHJlc3VsdC5zdHJpbmdWYWx1ZSA9PSAnMSdcclxuXHJcbiAgICAgICAgICAgIC8vIEFic3RyYWN0XHJcbiAgICAgICAgICAgIGNvbnN0IGFic3RyYWN0WFByZXN1bHQgPSBkb20uZXZhbHVhdGUoXHJcbiAgICAgICAgICAgICAgICAnbnM6QWJzdHJhY3QvdGV4dCgpJyxcclxuICAgICAgICAgICAgICAgIGl0ZW0sXHJcbiAgICAgICAgICAgICAgICBuc1Jlc29sdmVyLFxyXG4gICAgICAgICAgICAgICAgWFBhdGhSZXN1bHQuU1RSSU5HX1RZUEUsXHJcbiAgICAgICAgICAgICAgICBudWxsXHJcbiAgICAgICAgICAgIClcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGFic3RyYWN0ID0gYWJzdHJhY3RYUHJlc3VsdC5zdHJpbmdWYWx1ZVxyXG5cclxuICAgICAgICAgICAgLy9DUlNcclxuICAgICAgICAgICAgY29uc3QgY3JzWFByZXN1bHQgPSBkb20uZXZhbHVhdGUoXHJcbiAgICAgICAgICAgICAgICAnbnM6Q1JTW3RleHQoKV0nLFxyXG4gICAgICAgICAgICAgICAgaXRlbSxcclxuICAgICAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgICAgICBYUGF0aFJlc3VsdC5PUkRFUkVEX05PREVfU05BUFNIT1RfVFlQRSxcclxuICAgICAgICAgICAgICAgIG51bGxcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBjb25zdCBjcnNBcnJheSA6IHN0cmluZ1tdID0gW11cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBjcnNYUHJlc3VsdC5zbmFwc2hvdExlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjcnMgPSBjcnNYUHJlc3VsdC5zbmFwc2hvdEl0ZW0oaik/LmZpcnN0Q2hpbGQ/Lm5vZGVWYWx1ZVxyXG4gICAgICAgICAgICAgICAgaWYgKCFjcnMpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgY3JzQXJyYXkucHVzaChjcnMpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgbGF5ZXJcclxuICAgICAgICAgICAgbGF5ZXJzLnB1c2gobmV3IExheWVyKG5hbWUsIHRpdGxlLCBxdWVyeWFibGUsIGFic3RyYWN0LCBjcnNBcnJheSkpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuICAgICAgICAvLyBUT0RPIGdldCBib3VuZGluZyBib3ggZm9yIGVhY2ggQ1JTXHJcbiAgICAgICAgLy8gVE9ETyBnZXQgbWF4IGltYWdlIGRpbWVuc2lvblxyXG4gICAgICAgIC8vIFRPRE8gbWF4IG1pbiByZXNvbHV0aW9uXHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgV01TU2VydmljZShcclxuICAgICAgICAgICAgYmFzZVVSTCxcclxuICAgICAgICAgICAgJzEuMy4wJywgLy8gVE9ETyBnZXQgdGhpcyB2YWx1ZSBmcm9tIENhcGFiaWxpdGllc1xyXG4gICAgICAgICAgICB0aXRsZSxcclxuICAgICAgICAgICAgbGF5ZXJzXHJcbiAgICAgICAgKSAgICAgICBcclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFdNU0NsaWVudCB9IGZyb20gXCIuL1dNU0NsaWVudFwiO1xyXG5cclxuY29uc3QgbWFwSW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJylcclxuLy8gY29uc3QgY2xpZW50ID0gbmV3IFdNU0NsaWVudCgnaHR0cHM6Ly9zZXJ2aXppZ2lzLnJlZ2lvbmUuZW1pbGlhLXJvbWFnbmEuaXQvd21zL2dlb2xvZ2lhMTBrP3JlcXVlc3Q9R2V0Q2FwYWJpbGl0aWVzJnNlcnZpY2U9V01TJylcclxuLy8gY29uc3QgY2xpZW50ID0gbmV3IFdNU0NsaWVudCgnaHR0cHM6Ly9iaW8uZGlzY29tYXAuZWVhLmV1cm9wYS5ldS9hcmNnaXMvc2VydmljZXMvRWNvc3lzdGVtL0Vjb3N5c3RlbV9NYXBfc2VydmljZS9NYXBTZXJ2ZXIvV01TU2VydmVyJylcclxuXHJcbmNvbnN0IGNsaWVudCA9IG5ldyBXTVNDbGllbnQoKVxyXG5cclxuY2xpZW50LmNvbm5lY3QoJ2h0dHBzOi8vYmlvLmRpc2NvbWFwLmVlYS5ldXJvcGEuZXUvYXJjZ2lzL3NlcnZpY2VzL0Vjb3N5c3RlbS9FY29zeXN0ZW1fTWFwX3NlcnZpY2UvTWFwU2VydmVyL1dNU1NlcnZlcicpLnRoZW4oKHNlcnZpY2UpID0+IHtcclxuICAgIHNlcnZpY2UuZ2V0TWFwKFxyXG4gICAgICAgICcyJyxcclxuICAgICAgICBbMTAuMzgyMDgyMjQsIDQ0LjM5Njk3MTU5LCAxMC40NDU3OTM0MzksIDQ0LjQzMzkyMzE1OV0sXHJcbiAgICAgICAgJ0NSUzo4NCcsXHJcbiAgICAgICAgMTM1MixcclxuICAgICAgICA3ODRcclxuICAgICkudGhlbigobWFwVVJMKSA9PiB7XHJcbiAgICAgICAgbWFwSW1nLnNyYyA9IG1hcFVSTFxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobWFwSW1nKVxyXG4gICAgICAgIHJldHVybiBzZXJ2aWNlLmdldEZlYXR1cmVJbmZvKFxyXG4gICAgICAgICAgICAnMicsXHJcbiAgICAgICAgICAgIFsxMC40MDMxMzUzMjUwMjgsIDQ0LjQxNDU4NjY5MTM5MDI0LCAxMC40MDMyNDA0NTkwMTIyLCA0NC40MTQ2NjE3ODc5OTYyM10sXHJcbiAgICAgICAgICAgICdDUlM6ODQnLFxyXG4gICAgICAgICAgICAyLFxyXG4gICAgICAgICAgICAyLFxyXG4gICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAxXHJcbiAgICAgICAgKVxyXG4gICAgfSkudGhlbigocmVzcG9uc2VIVE1MKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZG9jID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyhyZXNwb25zZUhUTUwsICd0ZXh0L2h0bWwnKVxyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gZG9jLmNoaWxkcmVuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBpdGVtID0gY2hpbGRyZW4uaXRlbShpKVxyXG4gICAgICAgICAgICBpZiAoIWl0ZW0pXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKGl0ZW0pXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufSlcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuLy8gaHR0cHM6Ly9iaW8uZGlzY29tYXAuZWVhLmV1cm9wYS5ldS9hcmNnaXMvc2VydmljZXMvRWNvc3lzdGVtL0Vjb3N5c3RlbV9NYXBfc2VydmljZS9NYXBTZXJ2ZXIvV01TU2VydmVyP1xyXG4vLyBTRVJWSUNFPVdNUyZWRVJTSU9OPTEuMy4wJlJFUVVFU1Q9R2V0TWFwJlxyXG4vLyBCQk9YPTEwLjM4MjA4MjI0NDY3NzM5ODgyJTJDNDQuMzk2OTcxNTk1MzY1NjIwNTQlMkMxMC40NDU3OTM0MzkxNDY2MzkxNiUyQzQ0LjQzMzkyMzE1OTczNTY2Mjk4JlxyXG4vLyBDUlM9Q1JTJTNBODQmV0lEVEg9MTM1MiZIRUlHSFQ9Nzg0JkxBWUVSUz0yJlNUWUxFUz0mRk9STUFUPWltYWdlJTJGcG5nJkRQST05NiZNQVBfUkVTT0xVVElPTj05NiZGT1JNQVRfT1BUSU9OUz1kcGklM0E5NiZUUkFOU1BBUkVOVD1UUlVFIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9