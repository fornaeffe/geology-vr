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
    constructor(name, queryable) {
        this.name = name;
        this.queryable = queryable;
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
        return __awaiter(this, void 0, void 0, function* () {
            // Build the URL
            const url = new URL(this.baseURL);
            url.searchParams.append('SERVICE', this.service);
            url.searchParams.append('REQUEST', 'GetCapabilities');
            // Fetch URL and parse response into a DOM
            const response = yield fetch(url);
            const xml = yield response.text();
            document.body.innerHTML = xml;
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
            // Get service title
            const titleXPresult = dom.evaluate('/ns:WMS_Capabilities/ns:Service/ns:Title/text()', dom, nsResolver, XPathResult.STRING_TYPE, null);
            this.title = titleXPresult.stringValue;
            // Find all layers
            const layersXPresult = dom.evaluate('/ns:WMS_Capabilities/ns:Capability/ns:Layer/ns:Layer', dom, nsResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            // Get layer info
            for (let i = 0; i < layersXPresult.snapshotLength; i++) {
                const item = layersXPresult.snapshotItem(i);
                if (!item)
                    continue;
                // Layer name
                const nameNodeXPresult = dom.evaluate('ns:Name/text()', item, nsResolver, XPathResult.STRING_TYPE, null);
                const name = nameNodeXPresult.stringValue;
                // Is queryable?
                const queryableXPresult = dom.evaluate('@queryable', item, nsResolver, XPathResult.STRING_TYPE, null);
                const queryable = queryableXPresult.stringValue == '1';
                // Create new layer
                this.layers.push(new Layer(name, queryable));
            }
            console.log('Service: ' + this.title);
            console.dir(this.layers);
            // TODO creare una proprietà contenenete i nomi dei layers, e se sono queryable
            // TODO creare l'oggetto layer, contenente i CRS di ciascun layer e le relative BBox
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

const client = new _WMSClient__WEBPACK_IMPORTED_MODULE_0__.WMSClient('https://servizigis.regione.emilia-romagna.it/wms/geologia10k?request=GetCapabilities&service=WMS');

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUM7YUFDL0M7WUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUV4QiwrRUFBK0U7WUFDL0Usb0ZBQW9GO1FBRXhGLENBQUM7S0FBQTtDQUdKOzs7Ozs7O1VDNUpEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7QUNOd0M7QUFHeEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxpREFBUyxDQUFDLGtHQUFrRyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZ2VvbG9neS12ci8uL3NyYy9XTVNDbGllbnQudHMiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9nZW9sb2d5LXZyL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZ2VvbG9neS12ci93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2dlb2xvZ3ktdnIvLi9zcmMvd21zQ2xpZW50VGVzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBMYXllciB7XHJcbiAgICBuYW1lOiBzdHJpbmdcclxuICAgIHF1ZXJ5YWJsZTogYm9vbGVhblxyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIG5hbWU6IHN0cmluZyxcclxuICAgICAgICBxdWVyeWFibGU6IGJvb2xlYW5cclxuICAgICkge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWVcclxuICAgICAgICB0aGlzLnF1ZXJ5YWJsZSA9IHF1ZXJ5YWJsZVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgV01TQ2xpZW50IHtcclxuICAgIGJhc2VVUkw6IHN0cmluZ1xyXG4gICAgc2VydmljZTogJ1dNUycgfCAnV0NTJ1xyXG4gICAgdmVyc2lvbjogc3RyaW5nXHJcbiAgICB0aXRsZT86IHN0cmluZ1xyXG4gICAgbGF5ZXJzOiBMYXllcltdID0gW11cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICB1cmw6IHN0cmluZyxcclxuICAgICAgICBzZXJ2aWNlPzogJ1dNUycgfCAnV0NTJyxcclxuICAgICAgICB2ZXJzaW9uPzogc3RyaW5nXHJcbiAgICApIHtcclxuICAgICAgICAvLyBQYXJzZSBVUkwgcHJvdmlkZWRcclxuICAgICAgICBjb25zdCB1cmxQYXJ0cyA9IHVybC5zcGxpdChcIj9cIilcclxuICAgICAgICB0aGlzLmJhc2VVUkwgPSB1cmxQYXJ0c1swXVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBwYXJhbWV0ZXJzLCBnZXQgaW5mbyBmcm9tIHBhcmFtZXRlcnNcclxuICAgICAgICBpZiAodXJsUGFydHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBjb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHVybFBhcnRzWzFdKVxyXG4gICAgICAgICAgICBjb25zdCB1cmxTZXJ2aWNlID0gdXJsUGFyYW1zLmdldCgnU0VSVklDRScpIHx8IHVybFBhcmFtcy5nZXQoJ3NlcnZpY2UnKVxyXG4gICAgICAgICAgICBjb25zdCB1cmxWZXJzaW9uID0gdXJsUGFyYW1zLmdldCgnVkVSU0lPTicpIHx8IHVybFBhcmFtcy5nZXQoJ3ZlcnNpb24nKVxyXG5cclxuICAgICAgICAgICAgaWYgKHVybFNlcnZpY2UpIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZXJ2aWNlICYmIHVybFNlcnZpY2UgJiYgdXJsU2VydmljZSAhPSBzZXJ2aWNlKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignU2VydmljZSBzcGVjaWZpY2F0aW9uIGRpZmZlcnMuIFVzZWQgdGhlIG9uZSBmcm9tIFVSTCcpXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmICh1cmxTZXJ2aWNlID09ICdXTVMnIHx8IHVybFNlcnZpY2UgPT0gJ1dDUycpXHJcbiAgICAgICAgICAgICAgICAgICAgc2VydmljZSA9IHVybFNlcnZpY2VcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHVybFZlcnNpb24pIHtcclxuICAgICAgICAgICAgICAgIGlmICh2ZXJzaW9uICYmIHVybFZlcnNpb24gJiYgdXJsVmVyc2lvbiAhPSB2ZXJzaW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignVmVyc2lvbiBzcGVjaWZpY2F0aW9uIGRpZmZlcnMuIFVzZWQgdGhlIG9uIGVmcm9tIFVSTCcpXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHZlcnNpb24gPSB1cmxWZXJzaW9uXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIFlvdSBzaG91bGQgc3RhdGUgaWYgeW91IHdhbnQgV01TIG9yIFdDU1xyXG4gICAgICAgIGlmICghc2VydmljZSlcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZXJ2aWNlIHVuc3BlY2lmaWVkIGFuZCBub3QgcmV0cmlldmFibGUgZnJvbSBVUkwnKVxyXG5cclxuICAgICAgICB0aGlzLnNlcnZpY2UgPSBzZXJ2aWNlXHJcblxyXG4gICAgICAgIC8vIERlZmF1bHQgdmVyc2lvbi5cclxuICAgICAgICAvLyBUT0RPIFNob3VsZCB3ZSBtb3ZlIHRoaXMgYXMgYSBkZWZhdWx0IHBhcmFtZXRlciBvZiBjb25zdHJ1Y3Rvcj9cclxuICAgICAgICBpZiAoIXZlcnNpb24pXHJcbiAgICAgICAgICAgIHZlcnNpb24gPSAnMS4zLjAnXHJcblxyXG4gICAgICAgIHRoaXMudmVyc2lvbiA9IHZlcnNpb25cclxuXHJcbiAgICAgICAgLy8gTWFrZSBhIEdldENhcGFiaWxpdGllcyByZXF1ZXN0XHJcbiAgICAgICAgdGhpcy5nZXRDYXBhYmlsaXRpZXMoKVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldENhcGFiaWxpdGllcygpIHtcclxuICAgICAgICAvLyBCdWlsZCB0aGUgVVJMXHJcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTCh0aGlzLmJhc2VVUkwpXHJcbiAgICAgICAgdXJsLnNlYXJjaFBhcmFtcy5hcHBlbmQoJ1NFUlZJQ0UnLCB0aGlzLnNlcnZpY2UpICAgICBcclxuICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLmFwcGVuZCgnUkVRVUVTVCcsICdHZXRDYXBhYmlsaXRpZXMnKVxyXG5cclxuICAgICAgICAvLyBGZXRjaCBVUkwgYW5kIHBhcnNlIHJlc3BvbnNlIGludG8gYSBET01cclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybClcclxuICAgICAgICBjb25zdCB4bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KClcclxuICAgICAgICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IHhtbFxyXG4gICAgICAgIGNvbnN0IGRvbSA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcoeG1sLCAndGV4dC94bWwnKVxyXG5cclxuICAgICAgICAvLyBOb3cgZ2V0IGluZm8gZnJvbSByZXNwb25zZSB1c2luZyBYUGF0aFxyXG5cclxuICAgICAgICAvLyBHZXRDYXBhYmlsaXRpZXMgWE1MIGRvY3VtZW50IHNob3VsZCBoYXZlIGEgZGVmYXVsdCBuYW1lc3BhY2UgYW5kIG5vIHByZWZpeGVzLFxyXG4gICAgICAgIC8vIHNvIHRoZSBvbmx5IHdheSBJIGZvdW5kIHRvIG1ha2UgWFBhdGggd29ya3MgaXMgdGhpcyBjdXN0b20gbmFtZXNwYWNlIHJlc29sdmVyXHJcbiAgICAgICAgZnVuY3Rpb24gbnNSZXNvbHZlcihwcmVmaXg6IHN0cmluZykge1xyXG4gICAgICAgICAgICAvLyBVc2UgY3VzdG9tICducycgcHJlZml4IGZvciBkZWZhdWx0IG5hbWVzcGFjZSwgcmV0cmlldmVkIGluIHRoZSBYTUwgZG9jdW1lbnRcclxuICAgICAgICAgICAgaWYgKHByZWZpeCA9PT0gJ25zJylcclxuICAgICAgICAgICAgICAgIHJldHVybiBkb20ubG9va3VwTmFtZXNwYWNlVVJJKG51bGwpXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEdldCBzZXJ2aWNlIHRpdGxlXHJcbiAgICAgICAgY29uc3QgdGl0bGVYUHJlc3VsdCA9IGRvbS5ldmFsdWF0ZShcclxuICAgICAgICAgICAgJy9uczpXTVNfQ2FwYWJpbGl0aWVzL25zOlNlcnZpY2UvbnM6VGl0bGUvdGV4dCgpJyxcclxuICAgICAgICAgICAgZG9tLFxyXG4gICAgICAgICAgICBuc1Jlc29sdmVyLFxyXG4gICAgICAgICAgICBYUGF0aFJlc3VsdC5TVFJJTkdfVFlQRSxcclxuICAgICAgICAgICAgbnVsbFxyXG4gICAgICAgIClcclxuICAgICAgICB0aGlzLnRpdGxlID0gdGl0bGVYUHJlc3VsdC5zdHJpbmdWYWx1ZVxyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEZpbmQgYWxsIGxheWVyc1xyXG4gICAgICAgIGNvbnN0IGxheWVyc1hQcmVzdWx0ID0gZG9tLmV2YWx1YXRlKFxyXG4gICAgICAgICAgICAnL25zOldNU19DYXBhYmlsaXRpZXMvbnM6Q2FwYWJpbGl0eS9uczpMYXllci9uczpMYXllcicsXHJcbiAgICAgICAgICAgIGRvbSxcclxuICAgICAgICAgICAgbnNSZXNvbHZlcixcclxuICAgICAgICAgICAgWFBhdGhSZXN1bHQuT1JERVJFRF9OT0RFX1NOQVBTSE9UX1RZUEUsXHJcbiAgICAgICAgICAgIG51bGxcclxuICAgICAgICApXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gR2V0IGxheWVyIGluZm9cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxheWVyc1hQcmVzdWx0LnNuYXBzaG90TGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGxheWVyc1hQcmVzdWx0LnNuYXBzaG90SXRlbShpKVxyXG5cclxuICAgICAgICAgICAgaWYgKCFpdGVtKVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAvLyBMYXllciBuYW1lXHJcbiAgICAgICAgICAgIGNvbnN0IG5hbWVOb2RlWFByZXN1bHQgPSBkb20uZXZhbHVhdGUoXHJcbiAgICAgICAgICAgICAgICAnbnM6TmFtZS90ZXh0KCknLFxyXG4gICAgICAgICAgICAgICAgaXRlbSxcclxuICAgICAgICAgICAgICAgIG5zUmVzb2x2ZXIsXHJcbiAgICAgICAgICAgICAgICBYUGF0aFJlc3VsdC5TVFJJTkdfVFlQRSxcclxuICAgICAgICAgICAgICAgIG51bGxcclxuICAgICAgICAgICAgKVxyXG5cclxuICAgICAgICAgICAgY29uc3QgbmFtZSA9IG5hbWVOb2RlWFByZXN1bHQuc3RyaW5nVmFsdWVcclxuXHJcbiAgICAgICAgICAgIC8vIElzIHF1ZXJ5YWJsZT9cclxuICAgICAgICAgICAgY29uc3QgcXVlcnlhYmxlWFByZXN1bHQgPSBkb20uZXZhbHVhdGUoXHJcbiAgICAgICAgICAgICAgICAnQHF1ZXJ5YWJsZScsXHJcbiAgICAgICAgICAgICAgICBpdGVtLFxyXG4gICAgICAgICAgICAgICAgbnNSZXNvbHZlcixcclxuICAgICAgICAgICAgICAgIFhQYXRoUmVzdWx0LlNUUklOR19UWVBFLFxyXG4gICAgICAgICAgICAgICAgbnVsbFxyXG4gICAgICAgICAgICApXHJcblxyXG4gICAgICAgICAgICBjb25zdCBxdWVyeWFibGUgPSBxdWVyeWFibGVYUHJlc3VsdC5zdHJpbmdWYWx1ZSA9PSAnMSdcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBuZXcgbGF5ZXJcclxuICAgICAgICAgICAgdGhpcy5sYXllcnMucHVzaChuZXcgTGF5ZXIobmFtZSwgcXVlcnlhYmxlKSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdTZXJ2aWNlOiAnICsgdGhpcy50aXRsZSlcclxuICAgICAgICBjb25zb2xlLmRpcih0aGlzLmxheWVycylcclxuICAgICAgICBcclxuICAgICAgICAvLyBUT0RPIGNyZWFyZSB1bmEgcHJvcHJpZXTDoCBjb250ZW5lbmV0ZSBpIG5vbWkgZGVpIGxheWVycywgZSBzZSBzb25vIHF1ZXJ5YWJsZVxyXG4gICAgICAgIC8vIFRPRE8gY3JlYXJlIGwnb2dnZXR0byBsYXllciwgY29udGVuZW50ZSBpIENSUyBkaSBjaWFzY3VuIGxheWVyIGUgbGUgcmVsYXRpdmUgQkJveFxyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIFxyXG59XHJcblxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFdNU0NsaWVudCB9IGZyb20gXCIuL1dNU0NsaWVudFwiO1xyXG5cclxuXHJcbmNvbnN0IGNsaWVudCA9IG5ldyBXTVNDbGllbnQoJ2h0dHBzOi8vc2Vydml6aWdpcy5yZWdpb25lLmVtaWxpYS1yb21hZ25hLml0L3dtcy9nZW9sb2dpYTEwaz9yZXF1ZXN0PUdldENhcGFiaWxpdGllcyZzZXJ2aWNlPVdNUycpIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9