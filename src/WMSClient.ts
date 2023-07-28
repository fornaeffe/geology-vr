import { EventDispatcher } from "./EventDispatcher"

class Layer {
    name: string
    title: string
    queryable: boolean
    abstract: string
    CRS: string[]

    constructor(
        name: string,
        title: string,
        queryable: boolean,
        abstract: string,
        CRS: string[]
    ) {
        this.name = name
        this.title = title
        this.queryable = queryable
        this.abstract = abstract
        this.CRS = CRS || []
    }
}

export class WMSClient extends EventDispatcher {
    baseURL: string
    service: 'WMS' | 'WCS'
    version: string
    title?: string
    layers: Layer[] = []

    constructor(
        url: string,
        service?: 'WMS' | 'WCS',
        version?: string
    ) {
        super()
        // Parse URL provided
        const urlParts = url.split("?")
        this.baseURL = urlParts[0]
        
        // If there are parameters, get info from parameters
        if (urlParts.length > 1) {
            const urlParams = new URLSearchParams(urlParts[1])
            const urlService = urlParams.get('SERVICE') || urlParams.get('service')
            const urlVersion = urlParams.get('VERSION') || urlParams.get('version')

            if (urlService) {
                if (service && urlService && urlService != service)
                    console.warn('Service specification differs. Used the one from URL')
                
                if (urlService == 'WMS' || urlService == 'WCS')
                    service = urlService
            }

            if (urlVersion) {
                if (version && urlVersion && urlVersion != version)
                    console.warn('Version specification differs. Used the on efrom URL')
                
                version = urlVersion
            }

        }
        
        // You should state if you want WMS or WCS
        if (!service)
            throw new Error('Service unspecified and not retrievable from URL')

        this.service = service

        // Default version.
        // TODO Should we move this as a default parameter of constructor?
        if (!version)
            version = '1.3.0'

        this.version = version

        // Make a GetCapabilities request
        this.getCapabilities()
    }

    async getCapabilities() {
        // Build the URL
        const url = new URL(this.baseURL)
        url.searchParams.append('SERVICE', this.service)     
        url.searchParams.append('REQUEST', 'GetCapabilities')

        // Fetch URL and parse response into a DOM
        const response = await fetch(
            url,
            {
                cache: 'force-cache'
            }
        )
        const xml = await response.text()
        const dom = new DOMParser().parseFromString(xml, 'text/xml')

        // Now get info from response using XPath

        // GetCapabilities XML document should have a default namespace and no prefixes,
        // so the only way I found to make XPath works is this custom namespace resolver
        function nsResolver(prefix: string) {
            // Use custom 'ns' prefix for default namespace, retrieved in the XML document
            if (prefix === 'ns')
                return dom.lookupNamespaceURI(null)
            
            return null
            
        }

        
        const titleXPresult = dom.evaluate(
            '/ns:WMS_Capabilities/ns:Service/ns:Title/text()',
            dom,
            nsResolver,
            XPathResult.STRING_TYPE,
            null
        )
        this.title = titleXPresult.stringValue
        
        
        // Find all layers
        const layersXPresult = dom.evaluate(
            '//ns:Layer',
            dom,
            nsResolver,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        )
        
        // Get layer info
        for (let i = 0; i < layersXPresult.snapshotLength; i++) {
            const item = layersXPresult.snapshotItem(i)

            if (!item)
                continue;

            // Layer name
            const nameXPresult = dom.evaluate(
                'ns:Name/text()',
                item,
                nsResolver,
                XPathResult.STRING_TYPE,
                null
            )

            if (!nameXPresult.stringValue){
                console.log('Layer without name')
                continue
            }

            const name = nameXPresult.stringValue

            // Layer title
            const titleXPresult = dom.evaluate(
                'ns:Title/text()',
                item,
                nsResolver,
                XPathResult.STRING_TYPE,
                null
            )

            const title = titleXPresult.stringValue

            // Is queryable?
            const queryableXPresult = dom.evaluate(
                '@queryable',
                item,
                nsResolver,
                XPathResult.STRING_TYPE,
                null
            )

            const queryable = queryableXPresult.stringValue == '1'

            // Abstract
            const abstractXPresult = dom.evaluate(
                'ns:Abstract/text()',
                item,
                nsResolver,
                XPathResult.STRING_TYPE,
                null
            )

            const abstract = abstractXPresult.stringValue

            //CRS
            const crsXPresult = dom.evaluate(
                'ns:CRS[text()]',
                item,
                nsResolver,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null
            )
            const crsArray : string[] = []
            for (let j = 0; j < crsXPresult.snapshotLength; j++) {
                const crs = crsXPresult.snapshotItem(j)?.firstChild?.nodeValue
                if (!crs)
                    continue;

                crsArray.push(crs)
            }
            
            // Create new layer
            this.layers.push(new Layer(name, title, queryable, abstract, crsArray))
        }

        console.log('Service: ' + this.title)
        console.dir(this.layers)
        
        // TODO get bounding box for each CRS
        // TODO get max image dimension
        // TODO max min resolution

        this.dispatchEvent({type: 'connected', data: null})        
    }

    // TODO allow multiple layers
    async getMap(
        layerName: string,
        boundingBox: [number, number, number, number],
        CRS: string,
        width: number,
        height: number
    ) {
        // Check if layer exists
        const layer = this.layers.find((l) => l.name == layerName)
        if (!layer)
            throw new Error('Layer ' + layerName + ' not found in service ' + this.title)

        // Check if layer accepts this CRS
        if (!(layer.CRS.includes(CRS)))
            throw new Error('Layer ' + layerName + ' does not list CRS ' + CRS)
        
        // Check if bounding box is out of CRS bounds
        // TODO write code here

        // TODO check is image dimension is too big
        // TODO check if resolution is out of bounds

        // Build the URL
        const url = new URL(this.baseURL)
        url.searchParams.append('SERVICE', this.service)   
        url.searchParams.append('VERSION', this.version)     
        url.searchParams.append('REQUEST', 'GetMap')   
        url.searchParams.append('BBOX', boundingBox.join(','))   
        url.searchParams.append('CRS', CRS)   
        url.searchParams.append('WIDTH', width.toFixed(0))   
        url.searchParams.append('HEIGHT', height.toFixed(0))   
        url.searchParams.append('LAYERS', layerName)
        // TODO get from Capabilities options for parameters below
        url.searchParams.append('STYLES', '')
        url.searchParams.append('FORMAT', 'image/png')
        url.searchParams.append('DPI', '96')
        url.searchParams.append('MAP_RESOLUTION', '96')
        url.searchParams.append('FORMAT_OPTIONS', 'dpi:96')
        url.searchParams.append('TRANSPARENT', 'TRUE')

        // Fetch URL
        const response = await fetch(
            url,
            {
                cache: 'force-cache'
            }
        )
        
        // Return a local URL for the dowloaded image
        const blob = await response.blob();
        const blobURL = URL.createObjectURL(blob);
        return blobURL
    }

    // TODO allow multiple layers, and/or different map layer and query layer
    async getFeatureInfo(
        layerName: string,        
        boundingBox: [number, number, number, number],
        CRS: string,
        width: number,
        height: number,
        i: number,
        j: number
    ) {
        // https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystem_Map_service/MapServer/WMSServer?
        // SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&
        // BBOX=10.40313532502800342%2C44.41458669139024096%2C10.40324045901227379%2C44.41466178799623776&
        // CRS=CRS%3A84&WIDTH=2&HEIGHT=2&LAYERS=2&STYLES=&FORMAT=image%2Fpng&QUERY_LAYERS=2&INFO_FORMAT=text%2Fhtml&I=0&J=1

        // Check if layer exists
        const layer = this.layers.find((l) => l.name == layerName)
        if (!layer)
            throw new Error('Layer ' + layerName + ' not found in service ' + this.title)

        // Check if layer accepts this CRS
        if (!(layer.CRS.includes(CRS)))
            throw new Error('Layer ' + layerName + ' does not list CRS ' + CRS)
        
        // Check if bounding box is out of CRS bounds
        // TODO write code here

        // TODO check is image dimension is too big
        // TODO check if resolution is out of bounds

        // Build the URL
        const url = new URL(this.baseURL)
        url.searchParams.append('SERVICE', this.service)    
        url.searchParams.append('VERSION', this.version)    
        url.searchParams.append('REQUEST', 'GetFeatureInfo')   
        url.searchParams.append('BBOX', boundingBox.join(','))   
        url.searchParams.append('CRS', CRS)   
        url.searchParams.append('WIDTH', width.toFixed(0))   
        url.searchParams.append('HEIGHT', height.toFixed(0))   
        url.searchParams.append('LAYERS', layerName)
        // TODO get from Capabilities options for parameters below
        url.searchParams.append('STYLES', '')
        url.searchParams.append('FORMAT', 'image/png')
        url.searchParams.append('QUERY_LAYERS', layerName)
        url.searchParams.append('INFO_FORMAT', 'text/html')
        url.searchParams.append('I', i.toFixed(0))
        url.searchParams.append('J', j.toFixed(0))

        // Fetch URL
        const response = await fetch(
            url
        )
       return response.text()

       // TODO catch errors
    }

    
}

