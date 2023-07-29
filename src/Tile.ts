import * as THREE from 'three';
import { fromUrl } from "geotiff";
import { WMSService } from './WMSClient';
import { EventDispatcher } from './EventDispatcher';

export class Tile extends EventDispatcher{

    x: number; // Easting of tile center
    y: number; // Northing of tile center
    width: number; // Tile width in m
    height: number; // Tile height in m
    vertexResolution: number; // Distance from vertices in m
    textureResolution: number; // Texture pixel width in m
    CRS: string;
    geometry: THREE.PlaneGeometry;
    material: THREE.MeshLambertMaterial;
    mesh: THREE.Mesh;

    serviceMap: Map<WMSService, Map<string, string>> = new Map()
    service: WMSService | undefined = undefined
    layerName: string | undefined = undefined

    OPurl = ''; // Orthophoto blob URL
    GEOurl = ''; // Geology map blob URL


    // Customizable function that will be executed when DEM loading is complete
    onDEMLoad = () => { };

    constructor(
        CRS = 'EPSG:32632',
        x = 612400,
        y = 4919216,
        width = 4000,
        height = 3000,
        vertexResolution = 10,
        textureResolution = 2
    ) {
        super()

        this.CRS = CRS
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vertexResolution = vertexResolution;
        this.textureResolution = textureResolution;

        // Create tile geometry
        this.geometry = new THREE.PlaneGeometry(this.width, this.height, this.widthSegments(), this.heightSegments());
        this.geometry.rotateX(-Math.PI / 2);

        // Create tile material
        this.material = new THREE.MeshLambertMaterial();
        this.material.color = new THREE.Color(10526880);
        this.material.side = THREE.DoubleSide;

        // Create tile mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        // Load DEM
        this.loadDEM()

        // GetFeatureInfo listener
        this.mesh.addEventListener('click', (e) => {
            if (!this.service || !this.layerName || !e.data.x || !e.data.y ) {
                console.warn('Click on mesh without all necessary variables set')
                return
            }

            // Ask a getFeatureInfo request on a mock map request of 
            // 3x3 pixel, centered on the requested point
            const crsX = e.data.x * this.width + this.boundingBox()[0]
            const crsY = this.boundingBox()[3] - e.data.y * this.height
            const newBoundingBox = [
                crsX - 1.5 * this.textureResolution,
                crsY - 1.5 * this.textureResolution,
                crsX + 1.5 * this.textureResolution,
                crsY + 1.5 * this.textureResolution
            ]

            this.service.getFeatureInfo(
                this.layerName,
                newBoundingBox,
                this.CRS,
                3,
                3,
                1,
                1
            ).then((featureinfo) => {
                this.dispatchEvent({type: 'featureinfo', data: featureinfo})
            })
        } )
    }

    // Number of plane segments along width
    widthSegments() {
        return Math.floor(this.width / this.vertexResolution);
    }

    // Number of plane vertices along height
    heightSegments() {
        return Math.floor(this.height / this.vertexResolution);
    }

    // Number of plane vertices along width 
    widthPoints() {
        return this.widthSegments() + 1;
    }

    // Number of plane vertices along height
    heightPoints() {
        return this.heightSegments() + 1;
    }

    // Pixel width of texture
    textureWidth() {
        return Math.floor(this.width / this.textureResolution);
    }

    // Pixel heigth of texture
    textureHeight() {
        return Math.floor(this.height / this.textureResolution);
    }

    // Bounding box: [min x, min y, max x, max y] coordinates (in Tile's CRS)
    boundingBox() {
        return [
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.x + this.width / 2,
            this.y + this.height / 2
        ];
    }

    async loadDEM() {
        // TODO: cache!

        // Calculate bounding box for DEM
        const BBoxDEM = [
            this.x - (this.width + this.vertexResolution) / 2,
            this.y - (this.height + this.vertexResolution) / 2,
            this.x + (this.width + this.vertexResolution) / 2,
            this.y + (this.height + this.vertexResolution) / 2
        ];

        // TODO create a client for WCS also
        // Compose WCS request URL for DEM
        const WCSurl = 'https://tinitaly.pi.ingv.it/TINItaly_1_1/wcs?' +
            'SERVICE=WCS' +
            '&VERSION=1.0.0' +
            '&REQUEST=GetCoverage' +
            '&FORMAT=GeoTIFF' +
            '&COVERAGE=TINItaly_1_1:tinitaly_dem' +
            '&BBOX=' + BBoxDEM.join(',') +
            '&CRS=' + this.CRS +
            '&RESPONSE_CRS=' + this.CRS +
            '&WIDTH=' + this.widthPoints() +
            '&HEIGHT=' + this.heightPoints();

        // Fetch WCS GeoTIFF and read the raster data
        const myGeoTIFF = await fromUrl(WCSurl, { allowFullFile: true });
        const myGeoTIFFImage = await myGeoTIFF.getImage();
        const myRaster = await myGeoTIFFImage.readRasters();
        const myRasterData = myRaster[0];

        // Typeguard
        if (typeof myRasterData == 'number')
            throw new Error('myRaster[0] is a number, not a TypedArray');

        // Check if for every vertex in plane there is a data point in raster
        if (myRasterData.length != this.geometry.attributes.position.count)
            throw new Error('raster length differs from plane points count');

        // Assing elevation for each vertex
        myRasterData.forEach((value, i) => {
            if (typeof value != 'number')
                throw new Error("raster values are not numbers");

            this.geometry.attributes.position.setY(i, value);
        });

        // Update mesh
        this.mesh.geometry.dispose();
        this.mesh.geometry = this.geometry;

        // Execute custom function
        this.onDEMLoad();
        // TODO catch errors
        // TODO loading indicator
    }


    // Load and apply texture
    async applyTexture(service: WMSService, layerName: string, flatShading = true) {

        let url : string | undefined = undefined

        // If there is a previously stored map for the same service and layer, retrieve its URL
        const layerMap = this.serviceMap.get(service)
        if (layerMap) {
            const previousUrl = layerMap.get(layerName)
            if (previousUrl) url = previousUrl
        }

        // If there isn't a stored map, request a new one from the WMS service
        if (!url) {
            url = await service.getMap(
                layerName,
                this.boundingBox(),
                this.CRS,
                this.textureWidth(),
                this.textureHeight()
            )

            // Store the map URL for future uses
            if (layerMap) {
                layerMap.set(layerName, url)
            } else {
                const newLayerMap = new Map()
                newLayerMap.set(layerName, url)
                this.serviceMap.set(
                    service,
                    newLayerMap
                )
            }
        }

        
        if (!(this.mesh.material instanceof THREE.MeshLambertMaterial))
            throw new Error('Mesh material is not MeshLambertMaterial')

        // Apply texture
        const myTexture = new THREE.TextureLoader().load(url); // TODO callbacks (https://threejs.org/docs/#api/en/loaders/TextureLoader)
        this.mesh.material.map = myTexture

        // If needed, apply flatShading
        this.mesh.material.flatShading = flatShading
        this.mesh.material.needsUpdate = true

        // Save applied layer
        this.service = service
        this.layerName = layerName
    }

}
