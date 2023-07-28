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
/* harmony export */   WMSClient: () => (/* binding */ WMSClient)
/* harmony export */ });
/* harmony import */ var _EventDispatcher__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./EventDispatcher */ "./src/EventDispatcher.js");
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
class WMSClient extends _EventDispatcher__WEBPACK_IMPORTED_MODULE_0__.EventDispatcher {
    constructor(url, service, version) {
        super();
        this.layers = [];
        // Parse URL provided
        const urlParts = url.split("?");
        this.baseURL = urlParts[0];
        // If there are parameters, get info from parameters
        if (urlParts.length > 1) {
            const urlParams = new URLSearchParams(urlParts[1]);
            const urlService = urlParams.get('SERVICE') || urlParams.get('service');
            const urlVersion = urlParams.get('VERSION') || urlParams.get('version');
            if (urlService) {
                if (service && urlService && urlService != service)
                    console.warn('Service specification differs. Used the one from URL');
                if (urlService == 'WMS' || urlService == 'WCS')
                    service = urlService;
            }
            if (urlVersion) {
                if (version && urlVersion && urlVersion != version)
                    console.warn('Version specification differs. Used the on efrom URL');
                version = urlVersion;
            }
        }
        // You should state if you want WMS or WCS
        if (!service)
            throw new Error('Service unspecified and not retrievable from URL');
        this.service = service;
        // Default version.
        // TODO Should we move this as a default parameter of constructor?
        if (!version)
            version = '1.3.0';
        this.version = version;
        // Make a GetCapabilities request
        this.getCapabilities();
    }
    getCapabilities() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // Build the URL
            const url = new URL(this.baseURL);
            url.searchParams.append('SERVICE', this.service);
            url.searchParams.append('REQUEST', 'GetCapabilities');
            // Fetch URL and parse response into a DOM
            const response = yield fetch(url, {
                cache: 'force-cache'
            });
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
            this.title = titleXPresult.stringValue;
            // Find all layers
            const layersXPresult = dom.evaluate('//ns:Layer', dom, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            // Get layer info
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
                this.layers.push(new Layer(name, title, queryable, abstract, crsArray));
            }
            console.log('Service: ' + this.title);
            console.dir(this.layers);
            // TODO get bounding box for each CRS
            // TODO get max image dimension
            // TODO max min resolution
            this.dispatchEvent({ type: 'connected', data: null });
        });
    }
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
            url.searchParams.append('SERVICE', this.service);
            url.searchParams.append('REQUEST', 'GetMap');
            url.searchParams.append('VERSION', this.version);
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
        });
    }
}


/***/ }),

/***/ "./src/EventDispatcher.js":
/*!********************************!*\
  !*** ./src/EventDispatcher.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EventDispatcher: () => (/* binding */ EventDispatcher)
/* harmony export */ });
/**
 * @author mrdoob / http://mrdoob.com/
 */

class EventDispatcher {

	addEventListener( type, listener ) {

		if ( this._listeners === undefined ) this._listeners = {};

		const listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	}

	hasEventListener( type, listener ) {

		if ( this._listeners === undefined ) return false;

		const listeners = this._listeners;

		return listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1;

	}

	removeEventListener( type, listener ) {

		if ( this._listeners === undefined ) return;

		const listeners = this._listeners;
		const listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			const index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	}

	dispatchEvent( event ) {

		if ( this._listeners === undefined ) return;

		const listeners = this._listeners;
		const listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			// Make a copy, in case listeners are removed while iterating.
			const array = listenerArray.slice( 0 );

			for ( let i = 0, l = array.length; i < l; i ++ ) {

				array[ i ].call( this, event );

			}

		}

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
const client = new _WMSClient__WEBPACK_IMPORTED_MODULE_0__.WMSClient('https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystem_Map_service/MapServer/WMSServer', 'WMS');
client.addEventListener('connected', () => {
    client.getMap('2', [10.38208224, 44.39697159, 10.445793439, 44.433923159], 'CRS:84', 1352, 784).then((mapURL) => {
        mapImg.src = mapURL;
        document.body.appendChild(mapImg);
    });
});
// https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystem_Map_service/MapServer/WMSServer?
// SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&
// BBOX=10.38208224467739882%2C44.39697159536562054%2C10.44579343914663916%2C44.43392315973566298&
// CRS=CRS%3A84&WIDTH=1352&HEIGHT=784&LAYERS=2&STYLES=&FORMAT=image%2Fpng&DPI=96&MAP_RESOLUTION=96&FORMAT_OPTIONS=dpi%3A96&TRANSPARENT=TRUE

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LEVBQUU7SUFDdEMsTUFBTSxDQUFDLE1BQU0sQ0FDVCxHQUFHLEVBQ0gsQ0FBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxZQUFZLENBQUMsRUFDdEQsUUFBUSxFQUNSLElBQUksRUFDSixHQUFHLENBQ04sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtRQUNkLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTTtRQUNuQixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUM7SUFDckMsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBS0YsMEdBQTBHO0FBQzFHLDRDQUE0QztBQUM1QyxrR0FBa0c7QUFDbEcsMklBQTJJIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL3NyYy9XTVNDbGllbnQudHMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL3NyYy9FdmVudERpc3BhdGNoZXIuanMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2dlb2xvZ3ktdnIvLi9zcmMvd21zQ2xpZW50VGVzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudERpc3BhdGNoZXIgfSBmcm9tIFwiLi9FdmVudERpc3BhdGNoZXJcIlxyXG5cclxuY2xhc3MgTGF5ZXIge1xyXG4gICAgbmFtZTogc3RyaW5nXHJcbiAgICB0aXRsZTogc3RyaW5nXHJcbiAgICBxdWVyeWFibGU6IGJvb2xlYW5cclxuICAgIGFic3RyYWN0OiBzdHJpbmdcclxuICAgIENSUzogc3RyaW5nW11cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgdGl0bGU6IHN0cmluZyxcclxuICAgICAgICBxdWVyeWFibGU6IGJvb2xlYW4sXHJcbiAgICAgICAgYWJzdHJhY3Q6IHN0cmluZyxcclxuICAgICAgICBDUlM6IHN0cmluZ1tdXHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lXHJcbiAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlXHJcbiAgICAgICAgdGhpcy5xdWVyeWFibGUgPSBxdWVyeWFibGVcclxuICAgICAgICB0aGlzLmFic3RyYWN0ID0gYWJzdHJhY3RcclxuICAgICAgICB0aGlzLkNSUyA9IENSUyB8fCBbXVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgV01TQ2xpZW50IGV4dGVuZHMgRXZlbnREaXNwYXRjaGVyIHtcclxuICAgIGJhc2VVUkw6IHN0cmluZ1xyXG4gICAgc2VydmljZTogJ1dNUycgfCAnV0NTJ1xyXG4gICAgdmVyc2lvbjogc3RyaW5nXHJcbiAgICB0aXRsZT86IHN0cmluZ1xyXG4gICAgbGF5ZXJzOiBMYXllcltdID0gW11cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICB1cmw6IHN0cmluZyxcclxuICAgICAgICBzZXJ2aWNlPzogJ1dNUycgfCAnV0NTJyxcclxuICAgICAgICB2ZXJzaW9uPzogc3RyaW5nXHJcbiAgICApIHtcclxuICAgICAgICBzdXBlcigpXHJcbiAgICAgICAgLy8gUGFyc2UgVVJMIHByb3ZpZGVkXHJcbiAgICAgICAgY29uc3QgdXJsUGFydHMgPSB1cmwuc3BsaXQoXCI/XCIpXHJcbiAgICAgICAgdGhpcy5iYXNlVVJMID0gdXJsUGFydHNbMF1cclxuICAgICAgICBcclxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgcGFyYW1ldGVycywgZ2V0IGluZm8gZnJvbSBwYXJhbWV0ZXJzXHJcbiAgICAgICAgaWYgKHVybFBhcnRzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh1cmxQYXJ0c1sxXSlcclxuICAgICAgICAgICAgY29uc3QgdXJsU2VydmljZSA9IHVybFBhcmFtcy5nZXQoJ1NFUlZJQ0UnKSB8fCB1cmxQYXJhbXMuZ2V0KCdzZXJ2aWNlJylcclxuICAgICAgICAgICAgY29uc3QgdXJsVmVyc2lvbiA9IHVybFBhcmFtcy5nZXQoJ1ZFUlNJT04nKSB8fCB1cmxQYXJhbXMuZ2V0KCd2ZXJzaW9uJylcclxuXHJcbiAgICAgICAgICAgIGlmICh1cmxTZXJ2aWNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VydmljZSAmJiB1cmxTZXJ2aWNlICYmIHVybFNlcnZpY2UgIT0gc2VydmljZSlcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1NlcnZpY2Ugc3BlY2lmaWNhdGlvbiBkaWZmZXJzLiBVc2VkIHRoZSBvbmUgZnJvbSBVUkwnKVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAodXJsU2VydmljZSA9PSAnV01TJyB8fCB1cmxTZXJ2aWNlID09ICdXQ1MnKVxyXG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2UgPSB1cmxTZXJ2aWNlXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh1cmxWZXJzaW9uKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmVyc2lvbiAmJiB1cmxWZXJzaW9uICYmIHVybFZlcnNpb24gIT0gdmVyc2lvbilcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ1ZlcnNpb24gc3BlY2lmaWNhdGlvbiBkaWZmZXJzLiBVc2VkIHRoZSBvbiBlZnJvbSBVUkwnKVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB2ZXJzaW9uID0gdXJsVmVyc2lvblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICAvLyBZb3Ugc2hvdWxkIHN0YXRlIGlmIHlvdSB3YW50IFdNUyBvciBXQ1NcclxuICAgICAgICBpZiAoIXNlcnZpY2UpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU2VydmljZSB1bnNwZWNpZmllZCBhbmQgbm90IHJldHJpZXZhYmxlIGZyb20gVVJMJylcclxuXHJcbiAgICAgICAgdGhpcy5zZXJ2aWNlID0gc2VydmljZVxyXG5cclxuICAgICAgICAvLyBEZWZhdWx0IHZlcnNpb24uXHJcbiAgICAgICAgLy8gVE9ETyBTaG91bGQgd2UgbW92ZSB0aGlzIGFzIGEgZGVmYXVsdCBwYXJhbWV0ZXIgb2YgY29uc3RydWN0b3I/XHJcbiAgICAgICAgaWYgKCF2ZXJzaW9uKVxyXG4gICAgICAgICAgICB2ZXJzaW9uID0gJzEuMy4wJ1xyXG5cclxuICAgICAgICB0aGlzLnZlcnNpb24gPSB2ZXJzaW9uXHJcblxyXG4gICAgICAgIC8vIE1ha2UgYSBHZXRDYXBhYmlsaXRpZXMgcmVxdWVzdFxyXG4gICAgICAgIHRoaXMuZ2V0Q2FwYWJpbGl0aWVzKClcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXRDYXBhYmlsaXRpZXMoKSB7XHJcbiAgICAgICAgLy8gQnVpbGQgdGhlIFVSTFxyXG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwodGhpcy5iYXNlVVJMKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdTRVJWSUNFJywgdGhpcy5zZXJ2aWNlKSAgICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1JFUVVFU1QnLCAnR2V0Q2FwYWJpbGl0aWVzJylcclxuXHJcbiAgICAgICAgLy8gRmV0Y2ggVVJMIGFuZCBwYXJzZSByZXNwb25zZSBpbnRvIGEgRE9NXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcclxuICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYWNoZTogJ2ZvcmNlLWNhY2hlJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKVxyXG4gICAgICAgIGNvbnN0IHhtbCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKVxyXG4gICAgICAgIGNvbnN0IGRvbSA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcoeG1sLCAndGV4dC94bWwnKVxyXG5cclxuICAgICAgICAvLyBOb3cgZ2V0IGluZm8gZnJvbSByZXNwb25zZSB1c2luZyBYUGF0aFxyXG5cclxuICAgICAgICAvLyBHZXRDYXBhYmlsaXRpZXMgWE1MIGRvY3VtZW50IHNob3VsZCBoYXZlIGEgZGVmYXVsdCBuYW1lc3BhY2UgYW5kIG5vIHByZWZpeGVzLFxyXG4gICAgICAgIC8vIHNvIHRoZSBvbmx5IHdheSBJIGZvdW5kIHRvIG1ha2UgWFBhdGggd29ya3MgaXMgdGhpcyBjdXN0b20gbmFtZXNwYWNlIHJlc29sdmVyXHJcbiAgICAgICAgZnVuY3Rpb24gbnNSZXNvbHZlcihwcmVmaXg6IHN0cmluZykge1xyXG4gICAgICAgICAgICAvLyBVc2UgY3VzdG9tICducycgcHJlZml4IGZvciBkZWZhdWx0IG5hbWVzcGFjZSwgcmV0cmlldmVkIGluIHRoZSBYTUwgZG9jdW1lbnRcclxuICAgICAgICAgICAgaWYgKHByZWZpeCA9PT0gJ25zJylcclxuICAgICAgICAgICAgICAgIHJldHVybiBkb20ubG9va3VwTmFtZXNwYWNlVVJJKG51bGwpXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IHRpdGxlWFByZXN1bHQgPSBkb20uZXZhbHVhdGUoXHJcbiAgICAgICAgICAgICcvbnM6V01TX0NhcGFiaWxpdGllcy9uczpTZXJ2aWNlL25zOlRpdGxlL3RleHQoKScsXHJcbiAgICAgICAgICAgIGRvbSxcclxuICAgICAgICAgICAgbnNSZXNvbHZlcixcclxuICAgICAgICAgICAgWFBhdGhSZXN1bHQuU1RSSU5HX1RZUEUsXHJcbiAgICAgICAgICAgIG51bGxcclxuICAgICAgICApXHJcbiAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlWFByZXN1bHQuc3RyaW5nVmFsdWVcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvLyBGaW5kIGFsbCBsYXllcnNcclxuICAgICAgICBjb25zdCBsYXllcnNYUHJlc3VsdCA9IGRvbS5ldmFsdWF0ZShcclxuICAgICAgICAgICAgJy8vbnM6TGF5ZXInLFxyXG4gICAgICAgICAgICBkb20sXHJcbiAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgIFhQYXRoUmVzdWx0Lk9SREVSRURfTk9ERV9TTkFQU0hPVF9UWVBFLFxyXG4gICAgICAgICAgICBudWxsXHJcbiAgICAgICAgKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEdldCBsYXllciBpbmZvXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsYXllcnNYUHJlc3VsdC5zbmFwc2hvdExlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBsYXllcnNYUHJlc3VsdC5zbmFwc2hvdEl0ZW0oaSlcclxuXHJcbiAgICAgICAgICAgIGlmICghaXRlbSlcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgLy8gTGF5ZXIgbmFtZVxyXG4gICAgICAgICAgICBjb25zdCBuYW1lWFByZXN1bHQgPSBkb20uZXZhbHVhdGUoXHJcbiAgICAgICAgICAgICAgICAnbnM6TmFtZS90ZXh0KCknLFxyXG4gICAgICAgICAgICAgICAgaXRlbSxcclxuICAgICAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgICAgICBYUGF0aFJlc3VsdC5TVFJJTkdfVFlQRSxcclxuICAgICAgICAgICAgICAgIG51bGxcclxuICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICAgICAgaWYgKCFuYW1lWFByZXN1bHQuc3RyaW5nVmFsdWUpe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0xheWVyIHdpdGhvdXQgbmFtZScpXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBuYW1lID0gbmFtZVhQcmVzdWx0LnN0cmluZ1ZhbHVlXHJcblxyXG4gICAgICAgICAgICAvLyBMYXllciB0aXRsZVxyXG4gICAgICAgICAgICBjb25zdCB0aXRsZVhQcmVzdWx0ID0gZG9tLmV2YWx1YXRlKFxyXG4gICAgICAgICAgICAgICAgJ25zOlRpdGxlL3RleHQoKScsXHJcbiAgICAgICAgICAgICAgICBpdGVtLFxyXG4gICAgICAgICAgICAgICAgbnNSZXNvbHZlcixcclxuICAgICAgICAgICAgICAgIFhQYXRoUmVzdWx0LlNUUklOR19UWVBFLFxyXG4gICAgICAgICAgICAgICAgbnVsbFxyXG4gICAgICAgICAgICApXHJcblxyXG4gICAgICAgICAgICBjb25zdCB0aXRsZSA9IHRpdGxlWFByZXN1bHQuc3RyaW5nVmFsdWVcclxuXHJcbiAgICAgICAgICAgIC8vIElzIHF1ZXJ5YWJsZT9cclxuICAgICAgICAgICAgY29uc3QgcXVlcnlhYmxlWFByZXN1bHQgPSBkb20uZXZhbHVhdGUoXHJcbiAgICAgICAgICAgICAgICAnQHF1ZXJ5YWJsZScsXHJcbiAgICAgICAgICAgICAgICBpdGVtLFxyXG4gICAgICAgICAgICAgICAgbnNSZXNvbHZlcixcclxuICAgICAgICAgICAgICAgIFhQYXRoUmVzdWx0LlNUUklOR19UWVBFLFxyXG4gICAgICAgICAgICAgICAgbnVsbFxyXG4gICAgICAgICAgICApXHJcblxyXG4gICAgICAgICAgICBjb25zdCBxdWVyeWFibGUgPSBxdWVyeWFibGVYUHJlc3VsdC5zdHJpbmdWYWx1ZSA9PSAnMSdcclxuXHJcbiAgICAgICAgICAgIC8vIEFic3RyYWN0XHJcbiAgICAgICAgICAgIGNvbnN0IGFic3RyYWN0WFByZXN1bHQgPSBkb20uZXZhbHVhdGUoXHJcbiAgICAgICAgICAgICAgICAnbnM6QWJzdHJhY3QvdGV4dCgpJyxcclxuICAgICAgICAgICAgICAgIGl0ZW0sXHJcbiAgICAgICAgICAgICAgICBuc1Jlc29sdmVyLFxyXG4gICAgICAgICAgICAgICAgWFBhdGhSZXN1bHQuU1RSSU5HX1RZUEUsXHJcbiAgICAgICAgICAgICAgICBudWxsXHJcbiAgICAgICAgICAgIClcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGFic3RyYWN0ID0gYWJzdHJhY3RYUHJlc3VsdC5zdHJpbmdWYWx1ZVxyXG5cclxuICAgICAgICAgICAgLy9DUlNcclxuICAgICAgICAgICAgY29uc3QgY3JzWFByZXN1bHQgPSBkb20uZXZhbHVhdGUoXHJcbiAgICAgICAgICAgICAgICAnbnM6Q1JTW3RleHQoKV0nLFxyXG4gICAgICAgICAgICAgICAgaXRlbSxcclxuICAgICAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgICAgICBYUGF0aFJlc3VsdC5PUkRFUkVEX05PREVfU05BUFNIT1RfVFlQRSxcclxuICAgICAgICAgICAgICAgIG51bGxcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICBjb25zdCBjcnNBcnJheSA6IHN0cmluZ1tdID0gW11cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBjcnNYUHJlc3VsdC5zbmFwc2hvdExlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjcnMgPSBjcnNYUHJlc3VsdC5zbmFwc2hvdEl0ZW0oaik/LmZpcnN0Q2hpbGQ/Lm5vZGVWYWx1ZVxyXG4gICAgICAgICAgICAgICAgaWYgKCFjcnMpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgY3JzQXJyYXkucHVzaChjcnMpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgbGF5ZXJcclxuICAgICAgICAgICAgdGhpcy5sYXllcnMucHVzaChuZXcgTGF5ZXIobmFtZSwgdGl0bGUsIHF1ZXJ5YWJsZSwgYWJzdHJhY3QsIGNyc0FycmF5KSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlOiAnICsgdGhpcy50aXRsZSlcclxuICAgICAgICBjb25zb2xlLmRpcih0aGlzLmxheWVycylcclxuICAgICAgICBcclxuICAgICAgICAvLyBUT0RPIGdldCBib3VuZGluZyBib3ggZm9yIGVhY2ggQ1JTXHJcbiAgICAgICAgLy8gVE9ETyBnZXQgbWF4IGltYWdlIGRpbWVuc2lvblxyXG4gICAgICAgIC8vIFRPRE8gbWF4IG1pbiByZXNvbHV0aW9uXHJcblxyXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh7dHlwZTogJ2Nvbm5lY3RlZCcsIGRhdGE6IG51bGx9KSAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2V0TWFwKFxyXG4gICAgICAgIGxheWVyTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIGJvdW5kaW5nQm94OiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXSxcclxuICAgICAgICBDUlM6IHN0cmluZyxcclxuICAgICAgICB3aWR0aDogbnVtYmVyLFxyXG4gICAgICAgIGhlaWdodDogbnVtYmVyXHJcbiAgICApIHtcclxuICAgICAgICAvLyBDaGVjayBpZiBsYXllciBleGlzdHNcclxuICAgICAgICBjb25zdCBsYXllciA9IHRoaXMubGF5ZXJzLmZpbmQoKGwpID0+IGwubmFtZSA9PSBsYXllck5hbWUpXHJcbiAgICAgICAgaWYgKCFsYXllcilcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMYXllciAnICsgbGF5ZXJOYW1lICsgJyBub3QgZm91bmQgaW4gc2VydmljZSAnICsgdGhpcy50aXRsZSlcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgbGF5ZXIgYWNjZXB0cyB0aGlzIENSU1xyXG4gICAgICAgIGlmICghKGxheWVyLkNSUy5pbmNsdWRlcyhDUlMpKSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdMYXllciAnICsgbGF5ZXJOYW1lICsgJyBkb2VzIG5vdCBsaXN0IENSUyAnICsgQ1JTKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIENoZWNrIGlmIGJvdW5kaW5nIGJveCBpcyBvdXQgb2YgQ1JTIGJvdW5kc1xyXG4gICAgICAgIC8vIFRPRE8gd3JpdGUgY29kZSBoZXJlXHJcblxyXG4gICAgICAgIC8vIFRPRE8gY2hlY2sgaXMgaW1hZ2UgZGltZW5zaW9uIGlzIHRvbyBiaWdcclxuICAgICAgICAvLyBUT0RPIGNoZWNrIGlmIHJlc29sdXRpb24gaXMgb3V0IG9mIGJvdW5kc1xyXG5cclxuICAgICAgICAvLyBCdWlsZCB0aGUgVVJMXHJcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTCh0aGlzLmJhc2VVUkwpXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1NFUlZJQ0UnLCB0aGlzLnNlcnZpY2UpICAgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnUkVRVUVTVCcsICdHZXRNYXAnKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdWRVJTSU9OJywgdGhpcy52ZXJzaW9uKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdCQk9YJywgYm91bmRpbmdCb3guam9pbignLCcpKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdDUlMnLCBDUlMpICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1dJRFRIJywgd2lkdGgudG9GaXhlZCgwKSkgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnSEVJR0hUJywgaGVpZ2h0LnRvRml4ZWQoMCkpICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ0xBWUVSUycsIGxheWVyTmFtZSlcclxuICAgICAgICAvLyBUT0RPIGdldCBmcm9tIENhcGFiaWxpdGllcyBvcHRpb25zIGZvciBwYXJhbWV0ZXJzIGJlbG93XHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1NUWUxFUycsICcnKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdGT1JNQVQnLCAnaW1hZ2UvcG5nJylcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnRFBJJywgJzk2JylcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnTUFQX1JFU09MVVRJT04nLCAnOTYnKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdGT1JNQVRfT1BUSU9OUycsICdkcGk6OTYnKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdUUkFOU1BBUkVOVCcsICdUUlVFJylcclxuXHJcbiAgICAgICAgLy8gRmV0Y2ggVVJMXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcclxuICAgICAgICAgICAgdXJsLFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjYWNoZTogJ2ZvcmNlLWNhY2hlJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFJldHVybiBhIGxvY2FsIFVSTCBmb3IgdGhlIGRvd2xvYWRlZCBpbWFnZVxyXG4gICAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCByZXNwb25zZS5ibG9iKCk7XHJcbiAgICAgICAgY29uc3QgYmxvYlVSTCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XHJcbiAgICAgICAgcmV0dXJuIGJsb2JVUkxcclxuICAgIH1cclxuXHJcbiAgICBcclxufVxyXG5cclxuIiwiLyoqXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tL1xuICovXG5cbmNsYXNzIEV2ZW50RGlzcGF0Y2hlciB7XG5cblx0YWRkRXZlbnRMaXN0ZW5lciggdHlwZSwgbGlzdGVuZXIgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgdGhpcy5fbGlzdGVuZXJzID0ge307XG5cblx0XHRjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGxpc3RlbmVyc1sgdHlwZSBdID0gW107XG5cblx0XHR9XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdLmluZGV4T2YoIGxpc3RlbmVyICkgPT09IC0gMSApIHtcblxuXHRcdFx0bGlzdGVuZXJzWyB0eXBlIF0ucHVzaCggbGlzdGVuZXIgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0aGFzRXZlbnRMaXN0ZW5lciggdHlwZSwgbGlzdGVuZXIgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIGZhbHNlO1xuXG5cdFx0Y29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXG5cdFx0cmV0dXJuIGxpc3RlbmVyc1sgdHlwZSBdICE9PSB1bmRlZmluZWQgJiYgbGlzdGVuZXJzWyB0eXBlIF0uaW5kZXhPZiggbGlzdGVuZXIgKSAhPT0gLSAxO1xuXG5cdH1cblxuXHRyZW1vdmVFdmVudExpc3RlbmVyKCB0eXBlLCBsaXN0ZW5lciApIHtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSByZXR1cm47XG5cblx0XHRjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cdFx0Y29uc3QgbGlzdGVuZXJBcnJheSA9IGxpc3RlbmVyc1sgdHlwZSBdO1xuXG5cdFx0aWYgKCBsaXN0ZW5lckFycmF5ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGNvbnN0IGluZGV4ID0gbGlzdGVuZXJBcnJheS5pbmRleE9mKCBsaXN0ZW5lciApO1xuXG5cdFx0XHRpZiAoIGluZGV4ICE9PSAtIDEgKSB7XG5cblx0XHRcdFx0bGlzdGVuZXJBcnJheS5zcGxpY2UoIGluZGV4LCAxICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9XG5cblx0ZGlzcGF0Y2hFdmVudCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXG5cdFx0Y29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXHRcdGNvbnN0IGxpc3RlbmVyQXJyYXkgPSBsaXN0ZW5lcnNbIGV2ZW50LnR5cGUgXTtcblxuXHRcdGlmICggbGlzdGVuZXJBcnJheSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRldmVudC50YXJnZXQgPSB0aGlzO1xuXG5cdFx0XHQvLyBNYWtlIGEgY29weSwgaW4gY2FzZSBsaXN0ZW5lcnMgYXJlIHJlbW92ZWQgd2hpbGUgaXRlcmF0aW5nLlxuXHRcdFx0Y29uc3QgYXJyYXkgPSBsaXN0ZW5lckFycmF5LnNsaWNlKCAwICk7XG5cblx0XHRcdGZvciAoIGxldCBpID0gMCwgbCA9IGFycmF5Lmxlbmd0aDsgaSA8IGw7IGkgKysgKSB7XG5cblx0XHRcdFx0YXJyYXlbIGkgXS5jYWxsKCB0aGlzLCBldmVudCApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXG59XG5cbmV4cG9ydCB7IEV2ZW50RGlzcGF0Y2hlciB9O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBXTVNDbGllbnQgfSBmcm9tIFwiLi9XTVNDbGllbnRcIjtcclxuXHJcbmNvbnN0IG1hcEltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpXHJcbi8vIGNvbnN0IGNsaWVudCA9IG5ldyBXTVNDbGllbnQoJ2h0dHBzOi8vc2Vydml6aWdpcy5yZWdpb25lLmVtaWxpYS1yb21hZ25hLml0L3dtcy9nZW9sb2dpYTEwaz9yZXF1ZXN0PUdldENhcGFiaWxpdGllcyZzZXJ2aWNlPVdNUycpXHJcbmNvbnN0IGNsaWVudCA9IG5ldyBXTVNDbGllbnQoJ2h0dHBzOi8vYmlvLmRpc2NvbWFwLmVlYS5ldXJvcGEuZXUvYXJjZ2lzL3NlcnZpY2VzL0Vjb3N5c3RlbS9FY29zeXN0ZW1fTWFwX3NlcnZpY2UvTWFwU2VydmVyL1dNU1NlcnZlcicsICdXTVMnKVxyXG5cclxuY2xpZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Nvbm5lY3RlZCcsICgpID0+IHtcclxuICAgIGNsaWVudC5nZXRNYXAoXHJcbiAgICAgICAgJzInLFxyXG4gICAgICAgIFsxMC4zODIwODIyNCwgNDQuMzk2OTcxNTksIDEwLjQ0NTc5MzQzOSwgNDQuNDMzOTIzMTU5XSxcclxuICAgICAgICAnQ1JTOjg0JyxcclxuICAgICAgICAxMzUyLFxyXG4gICAgICAgIDc4NFxyXG4gICAgKS50aGVuKChtYXBVUkwpID0+IHtcclxuICAgICAgICBtYXBJbWcuc3JjID0gbWFwVVJMXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtYXBJbWcpXHJcbiAgICB9KVxyXG59KVxyXG5cclxuXHJcblxyXG5cclxuLy8gaHR0cHM6Ly9iaW8uZGlzY29tYXAuZWVhLmV1cm9wYS5ldS9hcmNnaXMvc2VydmljZXMvRWNvc3lzdGVtL0Vjb3N5c3RlbV9NYXBfc2VydmljZS9NYXBTZXJ2ZXIvV01TU2VydmVyP1xyXG4vLyBTRVJWSUNFPVdNUyZWRVJTSU9OPTEuMy4wJlJFUVVFU1Q9R2V0TWFwJlxyXG4vLyBCQk9YPTEwLjM4MjA4MjI0NDY3NzM5ODgyJTJDNDQuMzk2OTcxNTk1MzY1NjIwNTQlMkMxMC40NDU3OTM0MzkxNDY2MzkxNiUyQzQ0LjQzMzkyMzE1OTczNTY2Mjk4JlxyXG4vLyBDUlM9Q1JTJTNBODQmV0lEVEg9MTM1MiZIRUlHSFQ9Nzg0JkxBWUVSUz0yJlNUWUxFUz0mRk9STUFUPWltYWdlJTJGcG5nJkRQST05NiZNQVBfUkVTT0xVVElPTj05NiZGT1JNQVRfT1BUSU9OUz1kcGklM0E5NiZUUkFOU1BBUkVOVD1UUlVFIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9