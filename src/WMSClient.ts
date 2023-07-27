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

export class WMSClient {
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
        
        // TODO creare una proprietà contenenete i nomi dei layers, e se sono queryable
        // TODO creare l'oggetto layer, contenente i CRS di ciascun layer e le relative BBox
        
    }

    
}

