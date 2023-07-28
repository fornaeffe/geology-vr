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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDLEVBQ0QsQ0FBQyxDQUNKO0lBQ0wsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxFQUFFLEVBQUU7UUFDckIsTUFBTSxHQUFHLEdBQUcsSUFBSSxTQUFTLEVBQUUsQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQztRQUN0RSxNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUTtRQUM3QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN0QyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsSUFBSTtnQkFDTCxTQUFTO1lBRWIsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1NBQzdCO0lBQ0wsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBT0YsMEdBQTBHO0FBQzFHLDRDQUE0QztBQUM1QyxrR0FBa0c7QUFDbEcsMklBQTJJIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL3NyYy9XTVNDbGllbnQudHMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2dlb2xvZ3ktdnIvLi9zcmMvd21zQ2xpZW50VGVzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcclxuY2xhc3MgTGF5ZXIge1xyXG4gICAgbmFtZTogc3RyaW5nXHJcbiAgICB0aXRsZTogc3RyaW5nXHJcbiAgICBxdWVyeWFibGU6IGJvb2xlYW5cclxuICAgIGFic3RyYWN0OiBzdHJpbmdcclxuICAgIENSUzogc3RyaW5nW11cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgdGl0bGU6IHN0cmluZyxcclxuICAgICAgICBxdWVyeWFibGU6IGJvb2xlYW4sXHJcbiAgICAgICAgYWJzdHJhY3Q6IHN0cmluZyxcclxuICAgICAgICBDUlM6IHN0cmluZ1tdXHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lXHJcbiAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlXHJcbiAgICAgICAgdGhpcy5xdWVyeWFibGUgPSBxdWVyeWFibGVcclxuICAgICAgICB0aGlzLmFic3RyYWN0ID0gYWJzdHJhY3RcclxuICAgICAgICB0aGlzLkNSUyA9IENSUyB8fCBbXVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgV01TU2VydmljZSB7XHJcbiAgICBiYXNlVVJMOiBzdHJpbmdcclxuICAgIHZlcnNpb246IHN0cmluZ1xyXG4gICAgdGl0bGU6IHN0cmluZ1xyXG4gICAgbGF5ZXJzOiBMYXllcltdXHJcbiAgICAvLyBUT0RPIGFic3RyYWN0XHJcbiAgICAvLyBUT0RPIG9ubGluZSByZXNvdXJjZVxyXG4gICAgLy8gVE9ETyBjb250YWN0IGluZm9ybWF0aW9uXHJcbiAgICAvLyBUT0RPIGxheWVyIGxpbWl0XHJcbiAgICAvLyBUT0RPIG1heHdpZHRoXHJcbiAgICAvLyBUT0RPIG1heGhlaWdodFxyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIGJhc2VVUkw6IHN0cmluZyxcclxuICAgICAgICB2ZXJzaW9uOiBzdHJpbmcsXHJcbiAgICAgICAgdGl0bGU6IHN0cmluZyxcclxuICAgICAgICBsYXllcnM6IExheWVyW11cclxuICAgICkge1xyXG4gICAgICAgIHRoaXMuYmFzZVVSTCA9IGJhc2VVUkxcclxuICAgICAgICB0aGlzLnZlcnNpb24gPSB2ZXJzaW9uXHJcbiAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlXHJcbiAgICAgICAgdGhpcy5sYXllcnMgPSBsYXllcnNcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPIGFsbG93IG11bHRpcGxlIGxheWVyc1xyXG4gICAgYXN5bmMgZ2V0TWFwKFxyXG4gICAgICAgIGxheWVyTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIGJvdW5kaW5nQm94OiBudW1iZXJbXSxcclxuICAgICAgICBDUlM6IHN0cmluZyxcclxuICAgICAgICB3aWR0aDogbnVtYmVyLFxyXG4gICAgICAgIGhlaWdodDogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICAvLyBDaGVjayBpZiBsYXllciBleGlzdHNcclxuICAgICAgICBjb25zdCBsYXllciA9IHRoaXMubGF5ZXJzLmZpbmQoKGwpID0+IGwubmFtZSA9PSBsYXllck5hbWUpXHJcbiAgICAgICAgaWYgKCFsYXllcilcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMYXllciAnICsgbGF5ZXJOYW1lICsgJyBub3QgZm91bmQgaW4gc2VydmljZSAnICsgdGhpcy50aXRsZSlcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgbGF5ZXIgYWNjZXB0cyB0aGlzIENSU1xyXG4gICAgICAgIGlmICghKGxheWVyLkNSUy5pbmNsdWRlcyhDUlMpKSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMYXllciAnICsgbGF5ZXJOYW1lICsgJyBkb2VzIG5vdCBsaXN0IENSUyAnICsgQ1JTKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIENoZWNrIGlmIGJvdW5kaW5nIGJveCBpcyBvdXQgb2YgQ1JTIGJvdW5kc1xyXG4gICAgICAgIC8vIFRPRE8gd3JpdGUgY29kZSBoZXJlXHJcblxyXG4gICAgICAgIC8vIFRPRE8gY2hlY2sgaXMgaW1hZ2UgZGltZW5zaW9uIGlzIHRvbyBiaWdcclxuICAgICAgICAvLyBUT0RPIGNoZWNrIGlmIHJlc29sdXRpb24gaXMgb3V0IG9mIGJvdW5kc1xyXG5cclxuICAgICAgICAvLyBCdWlsZCB0aGUgVVJMXHJcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTCh0aGlzLmJhc2VVUkwpXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1NFUlZJQ0UnLCAnV01TJykgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdWRVJTSU9OJywgdGhpcy52ZXJzaW9uKSAgICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1JFUVVFU1QnLCAnR2V0TWFwJykgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnQkJPWCcsIGJvdW5kaW5nQm94LmpvaW4oJywnKSkgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnQ1JTJywgQ1JTKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdXSURUSCcsIHdpZHRoLnRvRml4ZWQoMCkpICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ0hFSUdIVCcsIGhlaWdodC50b0ZpeGVkKDApKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdMQVlFUlMnLCBsYXllck5hbWUpXHJcbiAgICAgICAgLy8gVE9ETyBnZXQgZnJvbSBDYXBhYmlsaXRpZXMgb3B0aW9ucyBmb3IgcGFyYW1ldGVycyBiZWxvd1xyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdTVFlMRVMnLCAnJylcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnRk9STUFUJywgJ2ltYWdlL3BuZycpXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ0RQSScsICc5NicpXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ01BUF9SRVNPTFVUSU9OJywgJzk2JylcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnRk9STUFUX09QVElPTlMnLCAnZHBpOjk2JylcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnVFJBTlNQQVJFTlQnLCAnVFJVRScpXHJcblxyXG4gICAgICAgIC8vIEZldGNoIFVSTFxyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXHJcbiAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FjaGU6ICdmb3JjZS1jYWNoZSdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIClcclxuICAgICAgICBcclxuICAgICAgICAvLyBSZXR1cm4gYSBsb2NhbCBVUkwgZm9yIHRoZSBkb3dsb2FkZWQgaW1hZ2VcclxuICAgICAgICBjb25zdCBibG9iID0gYXdhaXQgcmVzcG9uc2UuYmxvYigpO1xyXG4gICAgICAgIGNvbnN0IGJsb2JVUkwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xyXG4gICAgICAgIHJldHVybiBibG9iVVJMXHJcblxyXG4gICAgICAgIC8vIFRPRE8gY2F0Y2ggZXJyb3JzXHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETyBhbGxvdyBtdWx0aXBsZSBsYXllcnMsIGFuZC9vciBkaWZmZXJlbnQgbWFwIGxheWVyIGFuZCBxdWVyeSBsYXllclxyXG4gICAgYXN5bmMgZ2V0RmVhdHVyZUluZm8oXHJcbiAgICAgICAgbGF5ZXJOYW1lOiBzdHJpbmcsICAgICAgICBcclxuICAgICAgICBib3VuZGluZ0JveDogbnVtYmVyW10sXHJcbiAgICAgICAgQ1JTOiBzdHJpbmcsXHJcbiAgICAgICAgd2lkdGg6IG51bWJlcixcclxuICAgICAgICBoZWlnaHQ6IG51bWJlcixcclxuICAgICAgICBpOiBudW1iZXIsXHJcbiAgICAgICAgajogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICAvLyBDaGVjayBpZiBsYXllciBleGlzdHNcclxuICAgICAgICBjb25zdCBsYXllciA9IHRoaXMubGF5ZXJzLmZpbmQoKGwpID0+IGwubmFtZSA9PSBsYXllck5hbWUpXHJcbiAgICAgICAgaWYgKCFsYXllcilcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMYXllciAnICsgbGF5ZXJOYW1lICsgJyBub3QgZm91bmQgaW4gc2VydmljZSAnICsgdGhpcy50aXRsZSlcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgbGF5ZXIgYWNjZXB0cyB0aGlzIENSU1xyXG4gICAgICAgIGlmICghKGxheWVyLkNSUy5pbmNsdWRlcyhDUlMpKSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMYXllciAnICsgbGF5ZXJOYW1lICsgJyBkb2VzIG5vdCBsaXN0IENSUyAnICsgQ1JTKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIENoZWNrIGlmIGJvdW5kaW5nIGJveCBpcyBvdXQgb2YgQ1JTIGJvdW5kc1xyXG4gICAgICAgIC8vIFRPRE8gd3JpdGUgY29kZSBoZXJlXHJcblxyXG4gICAgICAgIC8vIFRPRE8gY2hlY2sgaXMgaW1hZ2UgZGltZW5zaW9uIGlzIHRvbyBiaWdcclxuICAgICAgICAvLyBUT0RPIGNoZWNrIGlmIHJlc29sdXRpb24gaXMgb3V0IG9mIGJvdW5kc1xyXG5cclxuICAgICAgICAvLyBCdWlsZCB0aGUgVVJMXHJcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTCh0aGlzLmJhc2VVUkwpXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1NFUlZJQ0UnLCAnV01TJykgICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1ZFUlNJT04nLCB0aGlzLnZlcnNpb24pICAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdSRVFVRVNUJywgJ0dldEZlYXR1cmVJbmZvJykgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnQkJPWCcsIGJvdW5kaW5nQm94LmpvaW4oJywnKSkgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnQ1JTJywgQ1JTKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdXSURUSCcsIHdpZHRoLnRvRml4ZWQoMCkpICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ0hFSUdIVCcsIGhlaWdodC50b0ZpeGVkKDApKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdMQVlFUlMnLCBsYXllck5hbWUpXHJcbiAgICAgICAgLy8gVE9ETyBnZXQgZnJvbSBDYXBhYmlsaXRpZXMgb3B0aW9ucyBmb3IgcGFyYW1ldGVycyBiZWxvd1xyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdTVFlMRVMnLCAnJylcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnRk9STUFUJywgJ2ltYWdlL3BuZycpXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1FVRVJZX0xBWUVSUycsIGxheWVyTmFtZSlcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnSU5GT19GT1JNQVQnLCAndGV4dC9odG1sJylcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnSScsIGkudG9GaXhlZCgwKSlcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnSicsIGoudG9GaXhlZCgwKSlcclxuXHJcbiAgICAgICAgLy8gRmV0Y2ggVVJMXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwpXHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKVxyXG5cclxuICAgICAgICAvLyBUT0RPIGNhdGNoIGVycm9yc1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgV01TQ2xpZW50IHtcclxuXHJcbiAgICBhc3luYyBjb25uZWN0KHVybDogc3RyaW5nKSB7XHJcbiAgICAgICAgLy8gUGFyc2UgVVJMIHByb3ZpZGVkXHJcbiAgICAgICAgY29uc3QgYmFzZVVSTCA9IHVybC5zcGxpdChcIj9cIilbMF0gICAgICAgIFxyXG5cclxuICAgICAgICBjb25zdCBnZXRDYXBhYmlsaXRpZXNVUkwgPSBuZXcgVVJMKGJhc2VVUkwpXHJcbiAgICAgICAgZ2V0Q2FwYWJpbGl0aWVzVVJMLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1NFUlZJQ0UnLCAnV01TJykgICAgIFxyXG4gICAgICAgIGdldENhcGFiaWxpdGllc1VSTC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdSRVFVRVNUJywgJ0dldENhcGFiaWxpdGllcycpXHJcblxyXG4gICAgICAgIC8vIEZldGNoIFVSTCBhbmQgcGFyc2UgcmVzcG9uc2UgaW50byBhIERPTVxyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZ2V0Q2FwYWJpbGl0aWVzVVJMKVxyXG4gICAgICAgIGNvbnN0IHhtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKVxyXG4gICAgICAgIGNvbnN0IGRvbSA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcoeG1sLCAndGV4dC94bWwnKVxyXG5cclxuICAgICAgICAvLyBOb3cgZ2V0IGluZm8gZnJvbSByZXNwb25zZSB1c2luZyBYUGF0aFxyXG5cclxuICAgICAgICAvLyBHZXRDYXBhYmlsaXRpZXMgWE1MIGRvY3VtZW50IHNob3VsZCBoYXZlIGEgZGVmYXVsdCBuYW1lc3BhY2UgYW5kIG5vIHByZWZpeGVzLFxyXG4gICAgICAgIC8vIHNvIHRoZSBvbmx5IHdheSBJIGZvdW5kIHRvIG1ha2UgWFBhdGggd29ya3MgaXMgdGhpcyBjdXN0b20gbmFtZXNwYWNlIHJlc29sdmVyXHJcbiAgICAgICAgZnVuY3Rpb24gbnNSZXNvbHZlcihwcmVmaXg6IHN0cmluZykge1xyXG4gICAgICAgICAgICAvLyBVc2UgY3VzdG9tICducycgcHJlZml4IGZvciBkZWZhdWx0IG5hbWVzcGFjZSwgcmV0cmlldmVkIGluIHRoZSBYTUwgZG9jdW1lbnRcclxuICAgICAgICAgICAgaWYgKHByZWZpeCA9PT0gJ25zJylcclxuICAgICAgICAgICAgICAgIHJldHVybiBkb20ubG9va3VwTmFtZXNwYWNlVVJJKG51bGwpXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IHRpdGxlWFByZXN1bHQgPSBkb20uZXZhbHVhdGUoXHJcbiAgICAgICAgICAgICcvbnM6V01TX0NhcGFiaWxpdGllcy9uczpTZXJ2aWNlL25zOlRpdGxlL3RleHQoKScsXHJcbiAgICAgICAgICAgIGRvbSxcclxuICAgICAgICAgICAgbnNSZXNvbHZlcixcclxuICAgICAgICAgICAgWFBhdGhSZXN1bHQuU1RSSU5HX1RZUEUsXHJcbiAgICAgICAgICAgIG51bGxcclxuICAgICAgICApXHJcbiAgICAgICAgY29uc3QgdGl0bGUgPSB0aXRsZVhQcmVzdWx0LnN0cmluZ1ZhbHVlXHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gRmluZCBhbGwgbGF5ZXJzXHJcbiAgICAgICAgY29uc3QgbGF5ZXJzWFByZXN1bHQgPSBkb20uZXZhbHVhdGUoXHJcbiAgICAgICAgICAgICcvL25zOkxheWVyJyxcclxuICAgICAgICAgICAgZG9tLFxyXG4gICAgICAgICAgICBuc1Jlc29sdmVyLFxyXG4gICAgICAgICAgICBYUGF0aFJlc3VsdC5PUkRFUkVEX05PREVfU05BUFNIT1RfVFlQRSxcclxuICAgICAgICAgICAgbnVsbFxyXG4gICAgICAgIClcclxuICAgICAgICBcclxuICAgICAgICAvLyBHZXQgbGF5ZXIgaW5mb1xyXG4gICAgICAgIGNvbnN0IGxheWVycyA6IExheWVyW10gPSBbXVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGF5ZXJzWFByZXN1bHQuc25hcHNob3RMZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBpdGVtID0gbGF5ZXJzWFByZXN1bHQuc25hcHNob3RJdGVtKGkpXHJcblxyXG4gICAgICAgICAgICBpZiAoIWl0ZW0pXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgIC8vIExheWVyIG5hbWVcclxuICAgICAgICAgICAgY29uc3QgbmFtZVhQcmVzdWx0ID0gZG9tLmV2YWx1YXRlKFxyXG4gICAgICAgICAgICAgICAgJ25zOk5hbWUvdGV4dCgpJyxcclxuICAgICAgICAgICAgICAgIGl0ZW0sXHJcbiAgICAgICAgICAgICAgICBuc1Jlc29sdmVyLFxyXG4gICAgICAgICAgICAgICAgWFBhdGhSZXN1bHQuU1RSSU5HX1RZUEUsXHJcbiAgICAgICAgICAgICAgICBudWxsXHJcbiAgICAgICAgICAgIClcclxuXHJcbiAgICAgICAgICAgIGlmICghbmFtZVhQcmVzdWx0LnN0cmluZ1ZhbHVlKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMYXllciB3aXRob3V0IG5hbWUnKVxyXG4gICAgICAgICAgICAgICAgY29udGludWVcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgbmFtZSA9IG5hbWVYUHJlc3VsdC5zdHJpbmdWYWx1ZVxyXG5cclxuICAgICAgICAgICAgLy8gTGF5ZXIgdGl0bGVcclxuICAgICAgICAgICAgY29uc3QgdGl0bGVYUHJlc3VsdCA9IGRvbS5ldmFsdWF0ZShcclxuICAgICAgICAgICAgICAgICduczpUaXRsZS90ZXh0KCknLFxyXG4gICAgICAgICAgICAgICAgaXRlbSxcclxuICAgICAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgICAgICBYUGF0aFJlc3VsdC5TVFJJTkdfVFlQRSxcclxuICAgICAgICAgICAgICAgIG51bGxcclxuICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICAgICAgY29uc3QgdGl0bGUgPSB0aXRsZVhQcmVzdWx0LnN0cmluZ1ZhbHVlXHJcblxyXG4gICAgICAgICAgICAvLyBJcyBxdWVyeWFibGU/XHJcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5YWJsZVhQcmVzdWx0ID0gZG9tLmV2YWx1YXRlKFxyXG4gICAgICAgICAgICAgICAgJ0BxdWVyeWFibGUnLFxyXG4gICAgICAgICAgICAgICAgaXRlbSxcclxuICAgICAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgICAgICBYUGF0aFJlc3VsdC5TVFJJTkdfVFlQRSxcclxuICAgICAgICAgICAgICAgIG51bGxcclxuICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcXVlcnlhYmxlID0gcXVlcnlhYmxlWFByZXN1bHQuc3RyaW5nVmFsdWUgPT0gJzEnXHJcblxyXG4gICAgICAgICAgICAvLyBBYnN0cmFjdFxyXG4gICAgICAgICAgICBjb25zdCBhYnN0cmFjdFhQcmVzdWx0ID0gZG9tLmV2YWx1YXRlKFxyXG4gICAgICAgICAgICAgICAgJ25zOkFic3RyYWN0L3RleHQoKScsXHJcbiAgICAgICAgICAgICAgICBpdGVtLFxyXG4gICAgICAgICAgICAgICAgbnNSZXNvbHZlcixcclxuICAgICAgICAgICAgICAgIFhQYXRoUmVzdWx0LlNUUklOR19UWVBFLFxyXG4gICAgICAgICAgICAgICAgbnVsbFxyXG4gICAgICAgICAgICApXHJcblxyXG4gICAgICAgICAgICBjb25zdCBhYnN0cmFjdCA9IGFic3RyYWN0WFByZXN1bHQuc3RyaW5nVmFsdWVcclxuXHJcbiAgICAgICAgICAgIC8vQ1JTXHJcbiAgICAgICAgICAgIGNvbnN0IGNyc1hQcmVzdWx0ID0gZG9tLmV2YWx1YXRlKFxyXG4gICAgICAgICAgICAgICAgJ25zOkNSU1t0ZXh0KCldJyxcclxuICAgICAgICAgICAgICAgIGl0ZW0sXHJcbiAgICAgICAgICAgICAgICBuc1Jlc29sdmVyLFxyXG4gICAgICAgICAgICAgICAgWFBhdGhSZXN1bHQuT1JERVJFRF9OT0RFX1NOQVBTSE9UX1RZUEUsXHJcbiAgICAgICAgICAgICAgICBudWxsXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgY29uc3QgY3JzQXJyYXkgOiBzdHJpbmdbXSA9IFtdXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgY3JzWFByZXN1bHQuc25hcHNob3RMZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY3JzID0gY3JzWFByZXN1bHQuc25hcHNob3RJdGVtKGopPy5maXJzdENoaWxkPy5ub2RlVmFsdWVcclxuICAgICAgICAgICAgICAgIGlmICghY3JzKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGNyc0FycmF5LnB1c2goY3JzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgbmV3IGxheWVyXHJcbiAgICAgICAgICAgIGxheWVycy5wdXNoKG5ldyBMYXllcihuYW1lLCB0aXRsZSwgcXVlcnlhYmxlLCBhYnN0cmFjdCwgY3JzQXJyYXkpKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVE9ETyBnZXQgYm91bmRpbmcgYm94IGZvciBlYWNoIENSU1xyXG4gICAgICAgIC8vIFRPRE8gZ2V0IG1heCBpbWFnZSBkaW1lbnNpb25cclxuICAgICAgICAvLyBUT0RPIG1heCBtaW4gcmVzb2x1dGlvblxyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFdNU1NlcnZpY2UoXHJcbiAgICAgICAgICAgIGJhc2VVUkwsXHJcbiAgICAgICAgICAgICcxLjMuMCcsIC8vIFRPRE8gZ2V0IHRoaXMgdmFsdWUgZnJvbSBDYXBhYmlsaXRpZXNcclxuICAgICAgICAgICAgdGl0bGUsXHJcbiAgICAgICAgICAgIGxheWVyc1xyXG4gICAgICAgICkgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBXTVNDbGllbnQgfSBmcm9tIFwiLi9XTVNDbGllbnRcIjtcclxuXHJcbmNvbnN0IG1hcEltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpXHJcbi8vIGNvbnN0IGNsaWVudCA9IG5ldyBXTVNDbGllbnQoJ2h0dHBzOi8vc2Vydml6aWdpcy5yZWdpb25lLmVtaWxpYS1yb21hZ25hLml0L3dtcy9nZW9sb2dpYTEwaz9yZXF1ZXN0PUdldENhcGFiaWxpdGllcyZzZXJ2aWNlPVdNUycpXHJcbi8vIGNvbnN0IGNsaWVudCA9IG5ldyBXTVNDbGllbnQoJ2h0dHBzOi8vYmlvLmRpc2NvbWFwLmVlYS5ldXJvcGEuZXUvYXJjZ2lzL3NlcnZpY2VzL0Vjb3N5c3RlbS9FY29zeXN0ZW1fTWFwX3NlcnZpY2UvTWFwU2VydmVyL1dNU1NlcnZlcicpXHJcblxyXG5jb25zdCBjbGllbnQgPSBuZXcgV01TQ2xpZW50KClcclxuXHJcbmNsaWVudC5jb25uZWN0KCdodHRwczovL2Jpby5kaXNjb21hcC5lZWEuZXVyb3BhLmV1L2FyY2dpcy9zZXJ2aWNlcy9FY29zeXN0ZW0vRWNvc3lzdGVtX01hcF9zZXJ2aWNlL01hcFNlcnZlci9XTVNTZXJ2ZXInKS50aGVuKChzZXJ2aWNlKSA9PiB7XHJcbiAgICBzZXJ2aWNlLmdldE1hcChcclxuICAgICAgICAnMicsXHJcbiAgICAgICAgWzEwLjM4MjA4MjI0LCA0NC4zOTY5NzE1OSwgMTAuNDQ1NzkzNDM5LCA0NC40MzM5MjMxNTldLFxyXG4gICAgICAgICdDUlM6ODQnLFxyXG4gICAgICAgIDEzNTIsXHJcbiAgICAgICAgNzg0XHJcbiAgICApLnRoZW4oKG1hcFVSTCkgPT4ge1xyXG4gICAgICAgIG1hcEltZy5zcmMgPSBtYXBVUkxcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG1hcEltZylcclxuICAgICAgICByZXR1cm4gc2VydmljZS5nZXRGZWF0dXJlSW5mbyhcclxuICAgICAgICAgICAgJzInLFxyXG4gICAgICAgICAgICBbMTAuNDAzMTM1MzI1MDI4LCA0NC40MTQ1ODY2OTEzOTAyNCwgMTAuNDAzMjQwNDU5MDEyMiwgNDQuNDE0NjYxNzg3OTk2MjNdLFxyXG4gICAgICAgICAgICAnQ1JTOjg0JyxcclxuICAgICAgICAgICAgMixcclxuICAgICAgICAgICAgMixcclxuICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgMVxyXG4gICAgICAgIClcclxuICAgIH0pLnRoZW4oKHJlc3BvbnNlSFRNTCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRvYyA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcocmVzcG9uc2VIVE1MLCAndGV4dC9odG1sJylcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGRvYy5jaGlsZHJlblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGNoaWxkcmVuLml0ZW0oaSlcclxuICAgICAgICAgICAgaWYgKCFpdGVtKVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZChpdGVtKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbn0pXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbi8vIGh0dHBzOi8vYmlvLmRpc2NvbWFwLmVlYS5ldXJvcGEuZXUvYXJjZ2lzL3NlcnZpY2VzL0Vjb3N5c3RlbS9FY29zeXN0ZW1fTWFwX3NlcnZpY2UvTWFwU2VydmVyL1dNU1NlcnZlcj9cclxuLy8gU0VSVklDRT1XTVMmVkVSU0lPTj0xLjMuMCZSRVFVRVNUPUdldE1hcCZcclxuLy8gQkJPWD0xMC4zODIwODIyNDQ2NzczOTg4MiUyQzQ0LjM5Njk3MTU5NTM2NTYyMDU0JTJDMTAuNDQ1NzkzNDM5MTQ2NjM5MTYlMkM0NC40MzM5MjMxNTk3MzU2NjI5OCZcclxuLy8gQ1JTPUNSUyUzQTg0JldJRFRIPTEzNTImSEVJR0hUPTc4NCZMQVlFUlM9MiZTVFlMRVM9JkZPUk1BVD1pbWFnZSUyRnBuZyZEUEk9OTYmTUFQX1JFU09MVVRJT049OTYmRk9STUFUX09QVElPTlM9ZHBpJTNBOTYmVFJBTlNQQVJFTlQ9VFJVRSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==