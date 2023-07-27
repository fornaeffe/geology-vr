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
class WMSClient {
    constructor(url, service, version) {
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

// const client = new WMSClient('https://servizigis.regione.emilia-romagna.it/wms/geologia10k?request=GetCapabilities&service=WMS')
const client = new _WMSClient__WEBPACK_IMPORTED_MODULE_0__.WMSClient('https://copernicus.discomap.eea.europa.eu/arcgis/services/Corine/CLC2018_WM/MapServer/WMSServer?request=GetCapabilities&service=WMS');

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QVEsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUMxRTtZQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDOztLQUszQjtDQUdKOzs7Ozs7O1VDck5EO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7QUNOd0M7QUFHeEMsbUlBQW1JO0FBQ25JLE1BQU0sTUFBTSxHQUFHLElBQUksaURBQVMsQ0FBQyxxSUFBcUksQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2dlb2xvZ3ktdnIvLi9zcmMvV01TQ2xpZW50LnRzIiwid2VicGFjazovL2dlb2xvZ3ktdnIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2dlb2xvZ3ktdnIvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyLy4vc3JjL3dtc0NsaWVudFRlc3QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgTGF5ZXIge1xyXG4gICAgbmFtZTogc3RyaW5nXHJcbiAgICB0aXRsZTogc3RyaW5nXHJcbiAgICBxdWVyeWFibGU6IGJvb2xlYW5cclxuICAgIGFic3RyYWN0OiBzdHJpbmdcclxuICAgIENSUzogc3RyaW5nW11cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBuYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgdGl0bGU6IHN0cmluZyxcclxuICAgICAgICBxdWVyeWFibGU6IGJvb2xlYW4sXHJcbiAgICAgICAgYWJzdHJhY3Q6IHN0cmluZyxcclxuICAgICAgICBDUlM6IHN0cmluZ1tdXHJcbiAgICApIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lXHJcbiAgICAgICAgdGhpcy50aXRsZSA9IHRpdGxlXHJcbiAgICAgICAgdGhpcy5xdWVyeWFibGUgPSBxdWVyeWFibGVcclxuICAgICAgICB0aGlzLmFic3RyYWN0ID0gYWJzdHJhY3RcclxuICAgICAgICB0aGlzLkNSUyA9IENSUyB8fCBbXVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgV01TQ2xpZW50IHtcclxuICAgIGJhc2VVUkw6IHN0cmluZ1xyXG4gICAgc2VydmljZTogJ1dNUycgfCAnV0NTJ1xyXG4gICAgdmVyc2lvbjogc3RyaW5nXHJcbiAgICB0aXRsZT86IHN0cmluZ1xyXG4gICAgbGF5ZXJzOiBMYXllcltdID0gW11cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICB1cmw6IHN0cmluZyxcclxuICAgICAgICBzZXJ2aWNlPzogJ1dNUycgfCAnV0NTJyxcclxuICAgICAgICB2ZXJzaW9uPzogc3RyaW5nXHJcbiAgICApIHtcclxuICAgICAgICAvLyBQYXJzZSBVUkwgcHJvdmlkZWRcclxuICAgICAgICBjb25zdCB1cmxQYXJ0cyA9IHVybC5zcGxpdChcIj9cIilcclxuICAgICAgICB0aGlzLmJhc2VVUkwgPSB1cmxQYXJ0c1swXVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBwYXJhbWV0ZXJzLCBnZXQgaW5mbyBmcm9tIHBhcmFtZXRlcnNcclxuICAgICAgICBpZiAodXJsUGFydHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHVybFBhcnRzWzFdKVxyXG4gICAgICAgICAgICBjb25zdCB1cmxTZXJ2aWNlID0gdXJsUGFyYW1zLmdldCgnU0VSVklDRScpIHx8IHVybFBhcmFtcy5nZXQoJ3NlcnZpY2UnKVxyXG4gICAgICAgICAgICBjb25zdCB1cmxWZXJzaW9uID0gdXJsUGFyYW1zLmdldCgnVkVSU0lPTicpIHx8IHVybFBhcmFtcy5nZXQoJ3ZlcnNpb24nKVxyXG5cclxuICAgICAgICAgICAgaWYgKHVybFNlcnZpY2UpIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZXJ2aWNlICYmIHVybFNlcnZpY2UgJiYgdXJsU2VydmljZSAhPSBzZXJ2aWNlKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignU2VydmljZSBzcGVjaWZpY2F0aW9uIGRpZmZlcnMuIFVzZWQgdGhlIG9uZSBmcm9tIFVSTCcpXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmICh1cmxTZXJ2aWNlID09ICdXTVMnIHx8IHVybFNlcnZpY2UgPT0gJ1dDUycpXHJcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZSA9IHVybFNlcnZpY2VcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHVybFZlcnNpb24pIHtcclxuICAgICAgICAgICAgICAgIGlmICh2ZXJzaW9uICYmIHVybFZlcnNpb24gJiYgdXJsVmVyc2lvbiAhPSB2ZXJzaW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignVmVyc2lvbiBzcGVjaWZpY2F0aW9uIGRpZmZlcnMuIFVzZWQgdGhlIG9uIGVmcm9tIFVSTCcpXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHZlcnNpb24gPSB1cmxWZXJzaW9uXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFlvdSBzaG91bGQgc3RhdGUgaWYgeW91IHdhbnQgV01TIG9yIFdDU1xyXG4gICAgICAgIGlmICghc2VydmljZSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXJ2aWNlIHVuc3BlY2lmaWVkIGFuZCBub3QgcmV0cmlldmFibGUgZnJvbSBVUkwnKVxyXG5cclxuICAgICAgICB0aGlzLnNlcnZpY2UgPSBzZXJ2aWNlXHJcblxyXG4gICAgICAgIC8vIERlZmF1bHQgdmVyc2lvbi5cclxuICAgICAgICAvLyBUT0RPIFNob3VsZCB3ZSBtb3ZlIHRoaXMgYXMgYSBkZWZhdWx0IHBhcmFtZXRlciBvZiBjb25zdHJ1Y3Rvcj9cclxuICAgICAgICBpZiAoIXZlcnNpb24pXHJcbiAgICAgICAgICAgIHZlcnNpb24gPSAnMS4zLjAnXHJcblxyXG4gICAgICAgIHRoaXMudmVyc2lvbiA9IHZlcnNpb25cclxuXHJcbiAgICAgICAgLy8gTWFrZSBhIEdldENhcGFiaWxpdGllcyByZXF1ZXN0XHJcbiAgICAgICAgdGhpcy5nZXRDYXBhYmlsaXRpZXMoKVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldENhcGFiaWxpdGllcygpIHtcclxuICAgICAgICAvLyBCdWlsZCB0aGUgVVJMXHJcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTCh0aGlzLmJhc2VVUkwpXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1NFUlZJQ0UnLCB0aGlzLnNlcnZpY2UpICAgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnUkVRVUVTVCcsICdHZXRDYXBhYmlsaXRpZXMnKVxyXG5cclxuICAgICAgICAvLyBGZXRjaCBVUkwgYW5kIHBhcnNlIHJlc3BvbnNlIGludG8gYSBET01cclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFxyXG4gICAgICAgICAgICB1cmwsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNhY2hlOiAnZm9yY2UtY2FjaGUnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApXHJcbiAgICAgICAgY29uc3QgeG1sID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpXHJcbiAgICAgICAgY29uc3QgZG9tID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyh4bWwsICd0ZXh0L3htbCcpXHJcblxyXG4gICAgICAgIC8vIE5vdyBnZXQgaW5mbyBmcm9tIHJlc3BvbnNlIHVzaW5nIFhQYXRoXHJcblxyXG4gICAgICAgIC8vIEdldENhcGFiaWxpdGllcyBYTUwgZG9jdW1lbnQgc2hvdWxkIGhhdmUgYSBkZWZhdWx0IG5hbWVzcGFjZSBhbmQgbm8gcHJlZml4ZXMsXHJcbiAgICAgICAgLy8gc28gdGhlIG9ubHkgd2F5IEkgZm91bmQgdG8gbWFrZSBYUGF0aCB3b3JrcyBpcyB0aGlzIGN1c3RvbSBuYW1lc3BhY2UgcmVzb2x2ZXJcclxuICAgICAgICBmdW5jdGlvbiBuc1Jlc29sdmVyKHByZWZpeDogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIC8vIFVzZSBjdXN0b20gJ25zJyBwcmVmaXggZm9yIGRlZmF1bHQgbmFtZXNwYWNlLCByZXRyaWV2ZWQgaW4gdGhlIFhNTCBkb2N1bWVudFxyXG4gICAgICAgICAgICBpZiAocHJlZml4ID09PSAnbnMnKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvbS5sb29rdXBOYW1lc3BhY2VVUkkobnVsbClcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgY29uc3QgdGl0bGVYUHJlc3VsdCA9IGRvbS5ldmFsdWF0ZShcclxuICAgICAgICAgICAgJy9uczpXTVNfQ2FwYWJpbGl0aWVzL25zOlNlcnZpY2UvbnM6VGl0bGUvdGV4dCgpJyxcclxuICAgICAgICAgICAgZG9tLFxyXG4gICAgICAgICAgICBuc1Jlc29sdmVyLFxyXG4gICAgICAgICAgICBYUGF0aFJlc3VsdC5TVFJJTkdfVFlQRSxcclxuICAgICAgICAgICAgbnVsbFxyXG4gICAgICAgIClcclxuICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGVYUHJlc3VsdC5zdHJpbmdWYWx1ZVxyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEZpbmQgYWxsIGxheWVyc1xyXG4gICAgICAgIGNvbnN0IGxheWVyc1hQcmVzdWx0ID0gZG9tLmV2YWx1YXRlKFxyXG4gICAgICAgICAgICAnLy9uczpMYXllcicsXHJcbiAgICAgICAgICAgIGRvbSxcclxuICAgICAgICAgICAgbnNSZXNvbHZlcixcclxuICAgICAgICAgICAgWFBhdGhSZXN1bHQuT1JERVJFRF9OT0RFX1NOQVBTSE9UX1RZUEUsXHJcbiAgICAgICAgICAgIG51bGxcclxuICAgICAgICApXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gR2V0IGxheWVyIGluZm9cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxheWVyc1hQcmVzdWx0LnNuYXBzaG90TGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGxheWVyc1hQcmVzdWx0LnNuYXBzaG90SXRlbShpKVxyXG5cclxuICAgICAgICAgICAgaWYgKCFpdGVtKVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAvLyBMYXllciBuYW1lXHJcbiAgICAgICAgICAgIGNvbnN0IG5hbWVYUHJlc3VsdCA9IGRvbS5ldmFsdWF0ZShcclxuICAgICAgICAgICAgICAgICduczpOYW1lL3RleHQoKScsXHJcbiAgICAgICAgICAgICAgICBpdGVtLFxyXG4gICAgICAgICAgICAgICAgbnNSZXNvbHZlcixcclxuICAgICAgICAgICAgICAgIFhQYXRoUmVzdWx0LlNUUklOR19UWVBFLFxyXG4gICAgICAgICAgICAgICAgbnVsbFxyXG4gICAgICAgICAgICApXHJcblxyXG4gICAgICAgICAgICBpZiAoIW5hbWVYUHJlc3VsdC5zdHJpbmdWYWx1ZSl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTGF5ZXIgd2l0aG91dCBuYW1lJylcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBuYW1lWFByZXN1bHQuc3RyaW5nVmFsdWVcclxuXHJcbiAgICAgICAgICAgIC8vIExheWVyIHRpdGxlXHJcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlWFByZXN1bHQgPSBkb20uZXZhbHVhdGUoXHJcbiAgICAgICAgICAgICAgICAnbnM6VGl0bGUvdGV4dCgpJyxcclxuICAgICAgICAgICAgICAgIGl0ZW0sXHJcbiAgICAgICAgICAgICAgICBuc1Jlc29sdmVyLFxyXG4gICAgICAgICAgICAgICAgWFBhdGhSZXN1bHQuU1RSSU5HX1RZUEUsXHJcbiAgICAgICAgICAgICAgICBudWxsXHJcbiAgICAgICAgICAgIClcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gdGl0bGVYUHJlc3VsdC5zdHJpbmdWYWx1ZVxyXG5cclxuICAgICAgICAgICAgLy8gSXMgcXVlcnlhYmxlP1xyXG4gICAgICAgICAgICBjb25zdCBxdWVyeWFibGVYUHJlc3VsdCA9IGRvbS5ldmFsdWF0ZShcclxuICAgICAgICAgICAgICAgICdAcXVlcnlhYmxlJyxcclxuICAgICAgICAgICAgICAgIGl0ZW0sXHJcbiAgICAgICAgICAgICAgICBuc1Jlc29sdmVyLFxyXG4gICAgICAgICAgICAgICAgWFBhdGhSZXN1bHQuU1RSSU5HX1RZUEUsXHJcbiAgICAgICAgICAgICAgICBudWxsXHJcbiAgICAgICAgICAgIClcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5YWJsZSA9IHF1ZXJ5YWJsZVhQcmVzdWx0LnN0cmluZ1ZhbHVlID09ICcxJ1xyXG5cclxuICAgICAgICAgICAgLy8gQWJzdHJhY3RcclxuICAgICAgICAgICAgY29uc3QgYWJzdHJhY3RYUHJlc3VsdCA9IGRvbS5ldmFsdWF0ZShcclxuICAgICAgICAgICAgICAgICduczpBYnN0cmFjdC90ZXh0KCknLFxyXG4gICAgICAgICAgICAgICAgaXRlbSxcclxuICAgICAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgICAgICBYUGF0aFJlc3VsdC5TVFJJTkdfVFlQRSxcclxuICAgICAgICAgICAgICAgIG51bGxcclxuICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICAgICAgY29uc3QgYWJzdHJhY3QgPSBhYnN0cmFjdFhQcmVzdWx0LnN0cmluZ1ZhbHVlXHJcblxyXG4gICAgICAgICAgICAvL0NSU1xyXG4gICAgICAgICAgICBjb25zdCBjcnNYUHJlc3VsdCA9IGRvbS5ldmFsdWF0ZShcclxuICAgICAgICAgICAgICAgICduczpDUlNbdGV4dCgpXScsXHJcbiAgICAgICAgICAgICAgICBpdGVtLFxyXG4gICAgICAgICAgICAgICAgbnNSZXNvbHZlcixcclxuICAgICAgICAgICAgICAgIFhQYXRoUmVzdWx0Lk9SREVSRURfTk9ERV9TTkFQU0hPVF9UWVBFLFxyXG4gICAgICAgICAgICAgICAgbnVsbFxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgICAgIGNvbnN0IGNyc0FycmF5IDogc3RyaW5nW10gPSBbXVxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IGNyc1hQcmVzdWx0LnNuYXBzaG90TGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNycyA9IGNyc1hQcmVzdWx0LnNuYXBzaG90SXRlbShqKT8uZmlyc3RDaGlsZD8ubm9kZVZhbHVlXHJcbiAgICAgICAgICAgICAgICBpZiAoIWNycylcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBjcnNBcnJheS5wdXNoKGNycylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gQ3JlYXRlIG5ldyBsYXllclxyXG4gICAgICAgICAgICB0aGlzLmxheWVycy5wdXNoKG5ldyBMYXllcihuYW1lLCB0aXRsZSwgcXVlcnlhYmxlLCBhYnN0cmFjdCwgY3JzQXJyYXkpKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coJ1NlcnZpY2U6ICcgKyB0aGlzLnRpdGxlKVxyXG4gICAgICAgIGNvbnNvbGUuZGlyKHRoaXMubGF5ZXJzKVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFRPRE8gY3JlYXJlIHVuYSBwcm9wcmlldMOgIGNvbnRlbmVuZXRlIGkgbm9taSBkZWkgbGF5ZXJzLCBlIHNlIHNvbm8gcXVlcnlhYmxlXHJcbiAgICAgICAgLy8gVE9ETyBjcmVhcmUgbCdvZ2dldHRvIGxheWVyLCBjb250ZW5lbnRlIGkgQ1JTIGRpIGNpYXNjdW4gbGF5ZXIgZSBsZSByZWxhdGl2ZSBCQm94XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgXHJcbn1cclxuXHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgV01TQ2xpZW50IH0gZnJvbSBcIi4vV01TQ2xpZW50XCI7XHJcblxyXG5cclxuLy8gY29uc3QgY2xpZW50ID0gbmV3IFdNU0NsaWVudCgnaHR0cHM6Ly9zZXJ2aXppZ2lzLnJlZ2lvbmUuZW1pbGlhLXJvbWFnbmEuaXQvd21zL2dlb2xvZ2lhMTBrP3JlcXVlc3Q9R2V0Q2FwYWJpbGl0aWVzJnNlcnZpY2U9V01TJylcclxuY29uc3QgY2xpZW50ID0gbmV3IFdNU0NsaWVudCgnaHR0cHM6Ly9jb3Blcm5pY3VzLmRpc2NvbWFwLmVlYS5ldXJvcGEuZXUvYXJjZ2lzL3NlcnZpY2VzL0NvcmluZS9DTEMyMDE4X1dNL01hcFNlcnZlci9XTVNTZXJ2ZXI/cmVxdWVzdD1HZXRDYXBhYmlsaXRpZXMmc2VydmljZT1XTVMnKSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==