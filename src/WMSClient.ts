
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

export class WMSService {
    baseURL: string
    version: string
    title: string
    layers: Layer[]
    // TODO abstract
    // TODO online resource
    // TODO contact information
    // TODO layer limit
    // TODO maxwidth
    // TODO maxheight

    constructor(
        baseURL: string,
        version: string,
        title: string,
        layers: Layer[]
    ) {
        this.baseURL = baseURL
        this.version = version
        this.title = title
        this.layers = layers
    }

    // TODO allow multiple layers
    async getMap(
        layerName: string,
        boundingBox: number[],
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
        url.searchParams.append('SERVICE', 'WMS')  
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

        // TODO catch errors
    }

    // TODO allow multiple layers, and/or different map layer and query layer
    async getFeatureInfo(
        layerName: string,        
        boundingBox: number[],
        CRS: string,
        width: number,
        height: number,
        i: number,
        j: number
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
        url.searchParams.append('SERVICE', 'WMS')    
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
        const response = await fetch(url)
        return response.text()

        // TODO catch errors
    }
}

export class WMSClient {

    async connect(url: string) {
        // Parse URL provided
        const baseURL = url.split("?")[0]        

        const getCapabilitiesURL = new URL(baseURL)
        getCapabilitiesURL.searchParams.append('SERVICE', 'WMS')     
        getCapabilitiesURL.searchParams.append('REQUEST', 'GetCapabilities')

        // Fetch URL and parse response into a DOM
        const response = await fetch(getCapabilitiesURL)
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
        const title = titleXPresult.stringValue
        
        
        // Find all layers
        const layersXPresult = dom.evaluate(
            '//ns:Layer',
            dom,
            nsResolver,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        )
        
        // Get layer info
        const layers : Layer[] = []
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
            layers.push(new Layer(name, title, queryable, abstract, crsArray))
        }

        
        // TODO get bounding box for each CRS
        // TODO get max image dimension
        // TODO max min resolution

        return new WMSService(
            baseURL,
            '1.3.0', // TODO get this value from Capabilities
            title,
            layers
        )       
    }
    
}

