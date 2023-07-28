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
            url.searchParams.append('SERVICE', this.service);
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
        });
    }
    // TODO allow multiple layers, and/or different map layer and query layer
    getFeatureInfo(layerName, boundingBox, CRS, width, height, i, j) {
        return __awaiter(this, void 0, void 0, function* () {
            // https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystem_Map_service/MapServer/WMSServer?
            // SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&
            // BBOX=10.40313532502800342%2C44.41458669139024096%2C10.40324045901227379%2C44.41466178799623776&
            // CRS=CRS%3A84&WIDTH=2&HEIGHT=2&LAYERS=2&STYLES=&FORMAT=image%2Fpng&QUERY_LAYERS=2&INFO_FORMAT=text%2Fhtml&I=0&J=1
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
        return client.getFeatureInfo('2', [10.403135325028, 44.41458669139024, 10.4032404590122, 44.41466178799623], 'CRS:84', 2, 2, 0, 1);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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dEQsUUFBUSxFQUNSLElBQUksRUFDSixHQUFHLENBQ04sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtRQUNkLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTTtRQUNuQixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUM7UUFDakMsT0FBTyxNQUFNLENBQUMsY0FBYyxDQUN4QixHQUFHLEVBQ0gsQ0FBQyxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsRUFDekUsUUFBUSxFQUNSLENBQUMsRUFDRCxDQUFDLEVBQ0QsQ0FBQyxFQUNELENBQUMsQ0FDSjtJQUNMLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFlBQVksRUFBRSxFQUFFO1FBQ3JCLE1BQU0sR0FBRyxHQUFHLElBQUksU0FBUyxFQUFFLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxXQUFXLENBQUM7UUFDdEUsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFFBQVE7UUFDN0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDdEMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDN0IsSUFBSSxDQUFDLElBQUk7Z0JBQ0wsU0FBUztZQUViLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztTQUM3QjtJQUNMLENBQUMsQ0FBQztBQUNOLENBQUMsQ0FBQztBQUtGLDBHQUEwRztBQUMxRyw0Q0FBNEM7QUFDNUMsa0dBQWtHO0FBQ2xHLDJJQUEySSIsInNvdXJjZXMiOlsid2VicGFjazovL2dlb2xvZ3ktdnIvLi9zcmMvV01TQ2xpZW50LnRzIiwid2VicGFjazovL2dlb2xvZ3ktdnIvLi9zcmMvRXZlbnREaXNwYXRjaGVyLmpzIiwid2VicGFjazovL2dlb2xvZ3ktdnIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2dlb2xvZ3ktdnIvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyLy4vc3JjL3dtc0NsaWVudFRlc3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRXZlbnREaXNwYXRjaGVyIH0gZnJvbSBcIi4vRXZlbnREaXNwYXRjaGVyXCJcclxuXHJcbmNsYXNzIExheWVyIHtcclxuICAgIG5hbWU6IHN0cmluZ1xyXG4gICAgdGl0bGU6IHN0cmluZ1xyXG4gICAgcXVlcnlhYmxlOiBib29sZWFuXHJcbiAgICBhYnN0cmFjdDogc3RyaW5nXHJcbiAgICBDUlM6IHN0cmluZ1tdXHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgbmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHRpdGxlOiBzdHJpbmcsXHJcbiAgICAgICAgcXVlcnlhYmxlOiBib29sZWFuLFxyXG4gICAgICAgIGFic3RyYWN0OiBzdHJpbmcsXHJcbiAgICAgICAgQ1JTOiBzdHJpbmdbXVxyXG4gICAgKSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZVxyXG4gICAgICAgIHRoaXMudGl0bGUgPSB0aXRsZVxyXG4gICAgICAgIHRoaXMucXVlcnlhYmxlID0gcXVlcnlhYmxlXHJcbiAgICAgICAgdGhpcy5hYnN0cmFjdCA9IGFic3RyYWN0XHJcbiAgICAgICAgdGhpcy5DUlMgPSBDUlMgfHwgW11cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFdNU0NsaWVudCBleHRlbmRzIEV2ZW50RGlzcGF0Y2hlciB7XHJcbiAgICBiYXNlVVJMOiBzdHJpbmdcclxuICAgIHNlcnZpY2U6ICdXTVMnIHwgJ1dDUydcclxuICAgIHZlcnNpb246IHN0cmluZ1xyXG4gICAgdGl0bGU/OiBzdHJpbmdcclxuICAgIGxheWVyczogTGF5ZXJbXSA9IFtdXHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgdXJsOiBzdHJpbmcsXHJcbiAgICAgICAgc2VydmljZT86ICdXTVMnIHwgJ1dDUycsXHJcbiAgICAgICAgdmVyc2lvbj86IHN0cmluZ1xyXG4gICAgKSB7XHJcbiAgICAgICAgc3VwZXIoKVxyXG4gICAgICAgIC8vIFBhcnNlIFVSTCBwcm92aWRlZFxyXG4gICAgICAgIGNvbnN0IHVybFBhcnRzID0gdXJsLnNwbGl0KFwiP1wiKVxyXG4gICAgICAgIHRoaXMuYmFzZVVSTCA9IHVybFBhcnRzWzBdXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIHBhcmFtZXRlcnMsIGdldCBpbmZvIGZyb20gcGFyYW1ldGVyc1xyXG4gICAgICAgIGlmICh1cmxQYXJ0cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXModXJsUGFydHNbMV0pXHJcbiAgICAgICAgICAgIGNvbnN0IHVybFNlcnZpY2UgPSB1cmxQYXJhbXMuZ2V0KCdTRVJWSUNFJykgfHwgdXJsUGFyYW1zLmdldCgnc2VydmljZScpXHJcbiAgICAgICAgICAgIGNvbnN0IHVybFZlcnNpb24gPSB1cmxQYXJhbXMuZ2V0KCdWRVJTSU9OJykgfHwgdXJsUGFyYW1zLmdldCgndmVyc2lvbicpXHJcblxyXG4gICAgICAgICAgICBpZiAodXJsU2VydmljZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlcnZpY2UgJiYgdXJsU2VydmljZSAmJiB1cmxTZXJ2aWNlICE9IHNlcnZpY2UpXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdTZXJ2aWNlIHNwZWNpZmljYXRpb24gZGlmZmVycy4gVXNlZCB0aGUgb25lIGZyb20gVVJMJylcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKHVybFNlcnZpY2UgPT0gJ1dNUycgfHwgdXJsU2VydmljZSA9PSAnV0NTJylcclxuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlID0gdXJsU2VydmljZVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodXJsVmVyc2lvbikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZlcnNpb24gJiYgdXJsVmVyc2lvbiAmJiB1cmxWZXJzaW9uICE9IHZlcnNpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdWZXJzaW9uIHNwZWNpZmljYXRpb24gZGlmZmVycy4gVXNlZCB0aGUgb24gZWZyb20gVVJMJylcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9IHVybFZlcnNpb25cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gWW91IHNob3VsZCBzdGF0ZSBpZiB5b3Ugd2FudCBXTVMgb3IgV0NTXHJcbiAgICAgICAgaWYgKCFzZXJ2aWNlKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcnZpY2UgdW5zcGVjaWZpZWQgYW5kIG5vdCByZXRyaWV2YWJsZSBmcm9tIFVSTCcpXHJcblxyXG4gICAgICAgIHRoaXMuc2VydmljZSA9IHNlcnZpY2VcclxuXHJcbiAgICAgICAgLy8gRGVmYXVsdCB2ZXJzaW9uLlxyXG4gICAgICAgIC8vIFRPRE8gU2hvdWxkIHdlIG1vdmUgdGhpcyBhcyBhIGRlZmF1bHQgcGFyYW1ldGVyIG9mIGNvbnN0cnVjdG9yP1xyXG4gICAgICAgIGlmICghdmVyc2lvbilcclxuICAgICAgICAgICAgdmVyc2lvbiA9ICcxLjMuMCdcclxuXHJcbiAgICAgICAgdGhpcy52ZXJzaW9uID0gdmVyc2lvblxyXG5cclxuICAgICAgICAvLyBNYWtlIGEgR2V0Q2FwYWJpbGl0aWVzIHJlcXVlc3RcclxuICAgICAgICB0aGlzLmdldENhcGFiaWxpdGllcygpXHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2V0Q2FwYWJpbGl0aWVzKCkge1xyXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBVUkxcclxuICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHRoaXMuYmFzZVVSTClcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnU0VSVklDRScsIHRoaXMuc2VydmljZSkgICAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdSRVFVRVNUJywgJ0dldENhcGFiaWxpdGllcycpXHJcblxyXG4gICAgICAgIC8vIEZldGNoIFVSTCBhbmQgcGFyc2UgcmVzcG9uc2UgaW50byBhIERPTVxyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXHJcbiAgICAgICAgICAgIHVybCxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FjaGU6ICdmb3JjZS1jYWNoZSdcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIClcclxuICAgICAgICBjb25zdCB4bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KClcclxuICAgICAgICBjb25zdCBkb20gPSBuZXcgRE9NUGFyc2VyKCkucGFyc2VGcm9tU3RyaW5nKHhtbCwgJ3RleHQveG1sJylcclxuXHJcbiAgICAgICAgLy8gTm93IGdldCBpbmZvIGZyb20gcmVzcG9uc2UgdXNpbmcgWFBhdGhcclxuXHJcbiAgICAgICAgLy8gR2V0Q2FwYWJpbGl0aWVzIFhNTCBkb2N1bWVudCBzaG91bGQgaGF2ZSBhIGRlZmF1bHQgbmFtZXNwYWNlIGFuZCBubyBwcmVmaXhlcyxcclxuICAgICAgICAvLyBzbyB0aGUgb25seSB3YXkgSSBmb3VuZCB0byBtYWtlIFhQYXRoIHdvcmtzIGlzIHRoaXMgY3VzdG9tIG5hbWVzcGFjZSByZXNvbHZlclxyXG4gICAgICAgIGZ1bmN0aW9uIG5zUmVzb2x2ZXIocHJlZml4OiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgLy8gVXNlIGN1c3RvbSAnbnMnIHByZWZpeCBmb3IgZGVmYXVsdCBuYW1lc3BhY2UsIHJldHJpZXZlZCBpbiB0aGUgWE1MIGRvY3VtZW50XHJcbiAgICAgICAgICAgIGlmIChwcmVmaXggPT09ICducycpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9tLmxvb2t1cE5hbWVzcGFjZVVSSShudWxsKVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuICAgICAgICBjb25zdCB0aXRsZVhQcmVzdWx0ID0gZG9tLmV2YWx1YXRlKFxyXG4gICAgICAgICAgICAnL25zOldNU19DYXBhYmlsaXRpZXMvbnM6U2VydmljZS9uczpUaXRsZS90ZXh0KCknLFxyXG4gICAgICAgICAgICBkb20sXHJcbiAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgIFhQYXRoUmVzdWx0LlNUUklOR19UWVBFLFxyXG4gICAgICAgICAgICBudWxsXHJcbiAgICAgICAgKVxyXG4gICAgICAgIHRoaXMudGl0bGUgPSB0aXRsZVhQcmVzdWx0LnN0cmluZ1ZhbHVlXHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gRmluZCBhbGwgbGF5ZXJzXHJcbiAgICAgICAgY29uc3QgbGF5ZXJzWFByZXN1bHQgPSBkb20uZXZhbHVhdGUoXHJcbiAgICAgICAgICAgICcvL25zOkxheWVyJyxcclxuICAgICAgICAgICAgZG9tLFxyXG4gICAgICAgICAgICBuc1Jlc29sdmVyLFxyXG4gICAgICAgICAgICBYUGF0aFJlc3VsdC5PUkRFUkVEX05PREVfU05BUFNIT1RfVFlQRSxcclxuICAgICAgICAgICAgbnVsbFxyXG4gICAgICAgIClcclxuICAgICAgICBcclxuICAgICAgICAvLyBHZXQgbGF5ZXIgaW5mb1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGF5ZXJzWFByZXN1bHQuc25hcHNob3RMZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBpdGVtID0gbGF5ZXJzWFByZXN1bHQuc25hcHNob3RJdGVtKGkpXHJcblxyXG4gICAgICAgICAgICBpZiAoIWl0ZW0pXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgIC8vIExheWVyIG5hbWVcclxuICAgICAgICAgICAgY29uc3QgbmFtZVhQcmVzdWx0ID0gZG9tLmV2YWx1YXRlKFxyXG4gICAgICAgICAgICAgICAgJ25zOk5hbWUvdGV4dCgpJyxcclxuICAgICAgICAgICAgICAgIGl0ZW0sXHJcbiAgICAgICAgICAgICAgICBuc1Jlc29sdmVyLFxyXG4gICAgICAgICAgICAgICAgWFBhdGhSZXN1bHQuU1RSSU5HX1RZUEUsXHJcbiAgICAgICAgICAgICAgICBudWxsXHJcbiAgICAgICAgICAgIClcclxuXHJcbiAgICAgICAgICAgIGlmICghbmFtZVhQcmVzdWx0LnN0cmluZ1ZhbHVlKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMYXllciB3aXRob3V0IG5hbWUnKVxyXG4gICAgICAgICAgICAgICAgY29udGludWVcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgbmFtZSA9IG5hbWVYUHJlc3VsdC5zdHJpbmdWYWx1ZVxyXG5cclxuICAgICAgICAgICAgLy8gTGF5ZXIgdGl0bGVcclxuICAgICAgICAgICAgY29uc3QgdGl0bGVYUHJlc3VsdCA9IGRvbS5ldmFsdWF0ZShcclxuICAgICAgICAgICAgICAgICduczpUaXRsZS90ZXh0KCknLFxyXG4gICAgICAgICAgICAgICAgaXRlbSxcclxuICAgICAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgICAgICBYUGF0aFJlc3VsdC5TVFJJTkdfVFlQRSxcclxuICAgICAgICAgICAgICAgIG51bGxcclxuICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICAgICAgY29uc3QgdGl0bGUgPSB0aXRsZVhQcmVzdWx0LnN0cmluZ1ZhbHVlXHJcblxyXG4gICAgICAgICAgICAvLyBJcyBxdWVyeWFibGU/XHJcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5YWJsZVhQcmVzdWx0ID0gZG9tLmV2YWx1YXRlKFxyXG4gICAgICAgICAgICAgICAgJ0BxdWVyeWFibGUnLFxyXG4gICAgICAgICAgICAgICAgaXRlbSxcclxuICAgICAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgICAgICBYUGF0aFJlc3VsdC5TVFJJTkdfVFlQRSxcclxuICAgICAgICAgICAgICAgIG51bGxcclxuICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcXVlcnlhYmxlID0gcXVlcnlhYmxlWFByZXN1bHQuc3RyaW5nVmFsdWUgPT0gJzEnXHJcblxyXG4gICAgICAgICAgICAvLyBBYnN0cmFjdFxyXG4gICAgICAgICAgICBjb25zdCBhYnN0cmFjdFhQcmVzdWx0ID0gZG9tLmV2YWx1YXRlKFxyXG4gICAgICAgICAgICAgICAgJ25zOkFic3RyYWN0L3RleHQoKScsXHJcbiAgICAgICAgICAgICAgICBpdGVtLFxyXG4gICAgICAgICAgICAgICAgbnNSZXNvbHZlcixcclxuICAgICAgICAgICAgICAgIFhQYXRoUmVzdWx0LlNUUklOR19UWVBFLFxyXG4gICAgICAgICAgICAgICAgbnVsbFxyXG4gICAgICAgICAgICApXHJcblxyXG4gICAgICAgICAgICBjb25zdCBhYnN0cmFjdCA9IGFic3RyYWN0WFByZXN1bHQuc3RyaW5nVmFsdWVcclxuXHJcbiAgICAgICAgICAgIC8vQ1JTXHJcbiAgICAgICAgICAgIGNvbnN0IGNyc1hQcmVzdWx0ID0gZG9tLmV2YWx1YXRlKFxyXG4gICAgICAgICAgICAgICAgJ25zOkNSU1t0ZXh0KCldJyxcclxuICAgICAgICAgICAgICAgIGl0ZW0sXHJcbiAgICAgICAgICAgICAgICBuc1Jlc29sdmVyLFxyXG4gICAgICAgICAgICAgICAgWFBhdGhSZXN1bHQuT1JERVJFRF9OT0RFX1NOQVBTSE9UX1RZUEUsXHJcbiAgICAgICAgICAgICAgICBudWxsXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgY29uc3QgY3JzQXJyYXkgOiBzdHJpbmdbXSA9IFtdXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgY3JzWFByZXN1bHQuc25hcHNob3RMZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY3JzID0gY3JzWFByZXN1bHQuc25hcHNob3RJdGVtKGopPy5maXJzdENoaWxkPy5ub2RlVmFsdWVcclxuICAgICAgICAgICAgICAgIGlmICghY3JzKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGNyc0FycmF5LnB1c2goY3JzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBDcmVhdGUgbmV3IGxheWVyXHJcbiAgICAgICAgICAgIHRoaXMubGF5ZXJzLnB1c2gobmV3IExheWVyKG5hbWUsIHRpdGxlLCBxdWVyeWFibGUsIGFic3RyYWN0LCBjcnNBcnJheSkpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnU2VydmljZTogJyArIHRoaXMudGl0bGUpXHJcbiAgICAgICAgY29uc29sZS5kaXIodGhpcy5sYXllcnMpXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gVE9ETyBnZXQgYm91bmRpbmcgYm94IGZvciBlYWNoIENSU1xyXG4gICAgICAgIC8vIFRPRE8gZ2V0IG1heCBpbWFnZSBkaW1lbnNpb25cclxuICAgICAgICAvLyBUT0RPIG1heCBtaW4gcmVzb2x1dGlvblxyXG5cclxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoe3R5cGU6ICdjb25uZWN0ZWQnLCBkYXRhOiBudWxsfSkgICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE8gYWxsb3cgbXVsdGlwbGUgbGF5ZXJzXHJcbiAgICBhc3luYyBnZXRNYXAoXHJcbiAgICAgICAgbGF5ZXJOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgYm91bmRpbmdCb3g6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdLFxyXG4gICAgICAgIENSUzogc3RyaW5nLFxyXG4gICAgICAgIHdpZHRoOiBudW1iZXIsXHJcbiAgICAgICAgaGVpZ2h0OiBudW1iZXJcclxuICAgICkge1xyXG4gICAgICAgIC8vIENoZWNrIGlmIGxheWVyIGV4aXN0c1xyXG4gICAgICAgIGNvbnN0IGxheWVyID0gdGhpcy5sYXllcnMuZmluZCgobCkgPT4gbC5uYW1lID09IGxheWVyTmFtZSlcclxuICAgICAgICBpZiAoIWxheWVyKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xheWVyICcgKyBsYXllck5hbWUgKyAnIG5vdCBmb3VuZCBpbiBzZXJ2aWNlICcgKyB0aGlzLnRpdGxlKVxyXG5cclxuICAgICAgICAvLyBDaGVjayBpZiBsYXllciBhY2NlcHRzIHRoaXMgQ1JTXHJcbiAgICAgICAgaWYgKCEobGF5ZXIuQ1JTLmluY2x1ZGVzKENSUykpKVxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xheWVyICcgKyBsYXllck5hbWUgKyAnIGRvZXMgbm90IGxpc3QgQ1JTICcgKyBDUlMpXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgYm91bmRpbmcgYm94IGlzIG91dCBvZiBDUlMgYm91bmRzXHJcbiAgICAgICAgLy8gVE9ETyB3cml0ZSBjb2RlIGhlcmVcclxuXHJcbiAgICAgICAgLy8gVE9ETyBjaGVjayBpcyBpbWFnZSBkaW1lbnNpb24gaXMgdG9vIGJpZ1xyXG4gICAgICAgIC8vIFRPRE8gY2hlY2sgaWYgcmVzb2x1dGlvbiBpcyBvdXQgb2YgYm91bmRzXHJcblxyXG4gICAgICAgIC8vIEJ1aWxkIHRoZSBVUkxcclxuICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHRoaXMuYmFzZVVSTClcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnU0VSVklDRScsIHRoaXMuc2VydmljZSkgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnVkVSU0lPTicsIHRoaXMudmVyc2lvbikgICAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdSRVFVRVNUJywgJ0dldE1hcCcpICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ0JCT1gnLCBib3VuZGluZ0JveC5qb2luKCcsJykpICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ0NSUycsIENSUykgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnV0lEVEgnLCB3aWR0aC50b0ZpeGVkKDApKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdIRUlHSFQnLCBoZWlnaHQudG9GaXhlZCgwKSkgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnTEFZRVJTJywgbGF5ZXJOYW1lKVxyXG4gICAgICAgIC8vIFRPRE8gZ2V0IGZyb20gQ2FwYWJpbGl0aWVzIG9wdGlvbnMgZm9yIHBhcmFtZXRlcnMgYmVsb3dcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnU1RZTEVTJywgJycpXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ0ZPUk1BVCcsICdpbWFnZS9wbmcnKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdEUEknLCAnOTYnKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdNQVBfUkVTT0xVVElPTicsICc5NicpXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ0ZPUk1BVF9PUFRJT05TJywgJ2RwaTo5NicpXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1RSQU5TUEFSRU5UJywgJ1RSVUUnKVxyXG5cclxuICAgICAgICAvLyBGZXRjaCBVUkxcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFxyXG4gICAgICAgICAgICB1cmwsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNhY2hlOiAnZm9yY2UtY2FjaGUnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gUmV0dXJuIGEgbG9jYWwgVVJMIGZvciB0aGUgZG93bG9hZGVkIGltYWdlXHJcbiAgICAgICAgY29uc3QgYmxvYiA9IGF3YWl0IHJlc3BvbnNlLmJsb2IoKTtcclxuICAgICAgICBjb25zdCBibG9iVVJMID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcclxuICAgICAgICByZXR1cm4gYmxvYlVSTFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE8gYWxsb3cgbXVsdGlwbGUgbGF5ZXJzLCBhbmQvb3IgZGlmZmVyZW50IG1hcCBsYXllciBhbmQgcXVlcnkgbGF5ZXJcclxuICAgIGFzeW5jIGdldEZlYXR1cmVJbmZvKFxyXG4gICAgICAgIGxheWVyTmFtZTogc3RyaW5nLCAgICAgICAgXHJcbiAgICAgICAgYm91bmRpbmdCb3g6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdLFxyXG4gICAgICAgIENSUzogc3RyaW5nLFxyXG4gICAgICAgIHdpZHRoOiBudW1iZXIsXHJcbiAgICAgICAgaGVpZ2h0OiBudW1iZXIsXHJcbiAgICAgICAgaTogbnVtYmVyLFxyXG4gICAgICAgIGo6IG51bWJlclxyXG4gICAgKSB7XHJcbiAgICAgICAgLy8gaHR0cHM6Ly9iaW8uZGlzY29tYXAuZWVhLmV1cm9wYS5ldS9hcmNnaXMvc2VydmljZXMvRWNvc3lzdGVtL0Vjb3N5c3RlbV9NYXBfc2VydmljZS9NYXBTZXJ2ZXIvV01TU2VydmVyP1xyXG4gICAgICAgIC8vIFNFUlZJQ0U9V01TJlZFUlNJT049MS4zLjAmUkVRVUVTVD1HZXRGZWF0dXJlSW5mbyZcclxuICAgICAgICAvLyBCQk9YPTEwLjQwMzEzNTMyNTAyODAwMzQyJTJDNDQuNDE0NTg2NjkxMzkwMjQwOTYlMkMxMC40MDMyNDA0NTkwMTIyNzM3OSUyQzQ0LjQxNDY2MTc4Nzk5NjIzNzc2JlxyXG4gICAgICAgIC8vIENSUz1DUlMlM0E4NCZXSURUSD0yJkhFSUdIVD0yJkxBWUVSUz0yJlNUWUxFUz0mRk9STUFUPWltYWdlJTJGcG5nJlFVRVJZX0xBWUVSUz0yJklORk9fRk9STUFUPXRleHQlMkZodG1sJkk9MCZKPTFcclxuXHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgbGF5ZXIgZXhpc3RzXHJcbiAgICAgICAgY29uc3QgbGF5ZXIgPSB0aGlzLmxheWVycy5maW5kKChsKSA9PiBsLm5hbWUgPT0gbGF5ZXJOYW1lKVxyXG4gICAgICAgIGlmICghbGF5ZXIpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTGF5ZXIgJyArIGxheWVyTmFtZSArICcgbm90IGZvdW5kIGluIHNlcnZpY2UgJyArIHRoaXMudGl0bGUpXHJcblxyXG4gICAgICAgIC8vIENoZWNrIGlmIGxheWVyIGFjY2VwdHMgdGhpcyBDUlNcclxuICAgICAgICBpZiAoIShsYXllci5DUlMuaW5jbHVkZXMoQ1JTKSkpXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTGF5ZXIgJyArIGxheWVyTmFtZSArICcgZG9lcyBub3QgbGlzdCBDUlMgJyArIENSUylcclxuICAgICAgICBcclxuICAgICAgICAvLyBDaGVjayBpZiBib3VuZGluZyBib3ggaXMgb3V0IG9mIENSUyBib3VuZHNcclxuICAgICAgICAvLyBUT0RPIHdyaXRlIGNvZGUgaGVyZVxyXG5cclxuICAgICAgICAvLyBUT0RPIGNoZWNrIGlzIGltYWdlIGRpbWVuc2lvbiBpcyB0b28gYmlnXHJcbiAgICAgICAgLy8gVE9ETyBjaGVjayBpZiByZXNvbHV0aW9uIGlzIG91dCBvZiBib3VuZHNcclxuXHJcbiAgICAgICAgLy8gQnVpbGQgdGhlIFVSTFxyXG4gICAgICAgIGNvbnN0IHVybCA9IG5ldyBVUkwodGhpcy5iYXNlVVJMKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdTRVJWSUNFJywgdGhpcy5zZXJ2aWNlKSAgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnVkVSU0lPTicsIHRoaXMudmVyc2lvbikgICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1JFUVVFU1QnLCAnR2V0RmVhdHVyZUluZm8nKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdCQk9YJywgYm91bmRpbmdCb3guam9pbignLCcpKSAgIFxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdDUlMnLCBDUlMpICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1dJRFRIJywgd2lkdGgudG9GaXhlZCgwKSkgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnSEVJR0hUJywgaGVpZ2h0LnRvRml4ZWQoMCkpICAgXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ0xBWUVSUycsIGxheWVyTmFtZSlcclxuICAgICAgICAvLyBUT0RPIGdldCBmcm9tIENhcGFiaWxpdGllcyBvcHRpb25zIGZvciBwYXJhbWV0ZXJzIGJlbG93XHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1NUWUxFUycsICcnKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdGT1JNQVQnLCAnaW1hZ2UvcG5nJylcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnUVVFUllfTEFZRVJTJywgbGF5ZXJOYW1lKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdJTkZPX0ZPUk1BVCcsICd0ZXh0L2h0bWwnKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdJJywgaS50b0ZpeGVkKDApKVxyXG4gICAgICAgIHVybC5zZWFyY2hQYXJhbXMuYXBwZW5kKCdKJywgai50b0ZpeGVkKDApKVxyXG5cclxuICAgICAgICAvLyBGZXRjaCBVUkxcclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFxyXG4gICAgICAgICAgICB1cmxcclxuICAgICAgICApXHJcbiAgICAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpXHJcblxyXG4gICAgICAgLy8gVE9ETyBjYXRjaCBlcnJvcnNcclxuICAgIH1cclxuXHJcbiAgICBcclxufVxyXG5cclxuIiwiLyoqXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tL1xuICovXG5cbmNsYXNzIEV2ZW50RGlzcGF0Y2hlciB7XG5cblx0YWRkRXZlbnRMaXN0ZW5lciggdHlwZSwgbGlzdGVuZXIgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgdGhpcy5fbGlzdGVuZXJzID0ge307XG5cblx0XHRjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGxpc3RlbmVyc1sgdHlwZSBdID0gW107XG5cblx0XHR9XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdLmluZGV4T2YoIGxpc3RlbmVyICkgPT09IC0gMSApIHtcblxuXHRcdFx0bGlzdGVuZXJzWyB0eXBlIF0ucHVzaCggbGlzdGVuZXIgKTtcblxuXHRcdH1cblxuXHR9XG5cblx0aGFzRXZlbnRMaXN0ZW5lciggdHlwZSwgbGlzdGVuZXIgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIGZhbHNlO1xuXG5cdFx0Y29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXG5cdFx0cmV0dXJuIGxpc3RlbmVyc1sgdHlwZSBdICE9PSB1bmRlZmluZWQgJiYgbGlzdGVuZXJzWyB0eXBlIF0uaW5kZXhPZiggbGlzdGVuZXIgKSAhPT0gLSAxO1xuXG5cdH1cblxuXHRyZW1vdmVFdmVudExpc3RlbmVyKCB0eXBlLCBsaXN0ZW5lciApIHtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSByZXR1cm47XG5cblx0XHRjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cdFx0Y29uc3QgbGlzdGVuZXJBcnJheSA9IGxpc3RlbmVyc1sgdHlwZSBdO1xuXG5cdFx0aWYgKCBsaXN0ZW5lckFycmF5ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGNvbnN0IGluZGV4ID0gbGlzdGVuZXJBcnJheS5pbmRleE9mKCBsaXN0ZW5lciApO1xuXG5cdFx0XHRpZiAoIGluZGV4ICE9PSAtIDEgKSB7XG5cblx0XHRcdFx0bGlzdGVuZXJBcnJheS5zcGxpY2UoIGluZGV4LCAxICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9XG5cblx0ZGlzcGF0Y2hFdmVudCggZXZlbnQgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXG5cdFx0Y29uc3QgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzO1xuXHRcdGNvbnN0IGxpc3RlbmVyQXJyYXkgPSBsaXN0ZW5lcnNbIGV2ZW50LnR5cGUgXTtcblxuXHRcdGlmICggbGlzdGVuZXJBcnJheSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRldmVudC50YXJnZXQgPSB0aGlzO1xuXG5cdFx0XHQvLyBNYWtlIGEgY29weSwgaW4gY2FzZSBsaXN0ZW5lcnMgYXJlIHJlbW92ZWQgd2hpbGUgaXRlcmF0aW5nLlxuXHRcdFx0Y29uc3QgYXJyYXkgPSBsaXN0ZW5lckFycmF5LnNsaWNlKCAwICk7XG5cblx0XHRcdGZvciAoIGxldCBpID0gMCwgbCA9IGFycmF5Lmxlbmd0aDsgaSA8IGw7IGkgKysgKSB7XG5cblx0XHRcdFx0YXJyYXlbIGkgXS5jYWxsKCB0aGlzLCBldmVudCApO1xuXG5cdFx0XHR9XG5cblx0XHR9XG5cblx0fVxuXG59XG5cbmV4cG9ydCB7IEV2ZW50RGlzcGF0Y2hlciB9O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBXTVNDbGllbnQgfSBmcm9tIFwiLi9XTVNDbGllbnRcIjtcclxuXHJcbmNvbnN0IG1hcEltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpXHJcbi8vIGNvbnN0IGNsaWVudCA9IG5ldyBXTVNDbGllbnQoJ2h0dHBzOi8vc2Vydml6aWdpcy5yZWdpb25lLmVtaWxpYS1yb21hZ25hLml0L3dtcy9nZW9sb2dpYTEwaz9yZXF1ZXN0PUdldENhcGFiaWxpdGllcyZzZXJ2aWNlPVdNUycpXHJcbmNvbnN0IGNsaWVudCA9IG5ldyBXTVNDbGllbnQoJ2h0dHBzOi8vYmlvLmRpc2NvbWFwLmVlYS5ldXJvcGEuZXUvYXJjZ2lzL3NlcnZpY2VzL0Vjb3N5c3RlbS9FY29zeXN0ZW1fTWFwX3NlcnZpY2UvTWFwU2VydmVyL1dNU1NlcnZlcicsICdXTVMnKVxyXG5cclxuY2xpZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Nvbm5lY3RlZCcsICgpID0+IHtcclxuICAgIGNsaWVudC5nZXRNYXAoXHJcbiAgICAgICAgJzInLFxyXG4gICAgICAgIFsxMC4zODIwODIyNCwgNDQuMzk2OTcxNTksIDEwLjQ0NTc5MzQzOSwgNDQuNDMzOTIzMTU5XSxcclxuICAgICAgICAnQ1JTOjg0JyxcclxuICAgICAgICAxMzUyLFxyXG4gICAgICAgIDc4NFxyXG4gICAgKS50aGVuKChtYXBVUkwpID0+IHtcclxuICAgICAgICBtYXBJbWcuc3JjID0gbWFwVVJMXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtYXBJbWcpXHJcbiAgICAgICAgcmV0dXJuIGNsaWVudC5nZXRGZWF0dXJlSW5mbyhcclxuICAgICAgICAgICAgJzInLFxyXG4gICAgICAgICAgICBbMTAuNDAzMTM1MzI1MDI4LCA0NC40MTQ1ODY2OTEzOTAyNCwgMTAuNDAzMjQwNDU5MDEyMiwgNDQuNDE0NjYxNzg3OTk2MjNdLFxyXG4gICAgICAgICAgICAnQ1JTOjg0JyxcclxuICAgICAgICAgICAgMixcclxuICAgICAgICAgICAgMixcclxuICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgMVxyXG4gICAgICAgIClcclxuICAgIH0pLnRoZW4oKHJlc3BvbnNlSFRNTCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGRvYyA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcocmVzcG9uc2VIVE1MLCAndGV4dC9odG1sJylcclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGRvYy5jaGlsZHJlblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGNoaWxkcmVuLml0ZW0oaSlcclxuICAgICAgICAgICAgaWYgKCFpdGVtKVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZChpdGVtKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbn0pXHJcblxyXG5cclxuXHJcblxyXG4vLyBodHRwczovL2Jpby5kaXNjb21hcC5lZWEuZXVyb3BhLmV1L2FyY2dpcy9zZXJ2aWNlcy9FY29zeXN0ZW0vRWNvc3lzdGVtX01hcF9zZXJ2aWNlL01hcFNlcnZlci9XTVNTZXJ2ZXI/XHJcbi8vIFNFUlZJQ0U9V01TJlZFUlNJT049MS4zLjAmUkVRVUVTVD1HZXRNYXAmXHJcbi8vIEJCT1g9MTAuMzgyMDgyMjQ0Njc3Mzk4ODIlMkM0NC4zOTY5NzE1OTUzNjU2MjA1NCUyQzEwLjQ0NTc5MzQzOTE0NjYzOTE2JTJDNDQuNDMzOTIzMTU5NzM1NjYyOTgmXHJcbi8vIENSUz1DUlMlM0E4NCZXSURUSD0xMzUyJkhFSUdIVD03ODQmTEFZRVJTPTImU1RZTEVTPSZGT1JNQVQ9aW1hZ2UlMkZwbmcmRFBJPTk2Jk1BUF9SRVNPTFVUSU9OPTk2JkZPUk1BVF9PUFRJT05TPWRwaSUzQTk2JlRSQU5TUEFSRU5UPVRSVUUiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=