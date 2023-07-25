import * as THREE from 'three';
import { fromUrl } from "geotiff";

export class Tile {
    x: number; // Easting of tile center
    y: number; // Northing of tile center
    width: number; // Tile width in m
    height: number; // Tile height in m
    vertexResolution: number; // Distance from vertices in m
    textureResolution: number; // Texture pixel width in m
    // CRS: string;
    geometry: THREE.PlaneGeometry;
    material: THREE.MeshLambertMaterial;
    mesh: THREE.Mesh;

    OPurl = ''; // Orthophoto blob URL
    GEOurl = ''; // Geology map blob URL


    // Customizable function that will be executed when DEM loading is complete
    onDEMLoad = () => { };

    constructor(
        x = 612400,
        y = 4919216,
        width = 4000,
        height = 3000,
        vertexResolution = 10,
        textureResolution = 2
    ) {
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

        this.load();
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



    load() {
        const CRS = 'EPSG:32632'; // Coordinate reference system


        // Calculate bounding box
        const BBox = [
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.x + this.width / 2,
            this.y + this.height / 2
        ];
        const BBoxDEM = [
            this.x - (this.width + this.vertexResolution) / 2,
            this.y - (this.height + this.vertexResolution) / 2,
            this.x + (this.width + this.vertexResolution) / 2,
            this.y + (this.height + this.vertexResolution) / 2
        ];

        // Compose WCS request URL for DEM
        const WCSurl = 'https://tinitaly.pi.ingv.it/TINItaly_1_1/wcs?' +
            'SERVICE=WCS' +
            '&VERSION=1.0.0' +
            '&REQUEST=GetCoverage' +
            '&FORMAT=GeoTIFF' +
            '&COVERAGE=TINItaly_1_1:tinitaly_dem' +
            '&BBOX=' + BBoxDEM.join(',') +
            '&CRS=' + CRS +
            '&RESPONSE_CRS=' + CRS +
            '&WIDTH=' + this.widthPoints() +
            '&HEIGHT=' + this.heightPoints();

        // Compose WMS request URL for orthophoto
        const WMSurl = 'https://servizigis.regione.emilia-romagna.it/wms/agea2020_rgb?' +
            'SERVICE=WMS&' +
            'VERSION=1.3.0' +
            '&REQUEST=GetMap' +
            '&BBOX=' + encodeURIComponent(BBox.join(',')) +
            '&CRS=' + encodeURIComponent(CRS) +
            '&WIDTH=' + this.textureWidth() +
            '&HEIGHT=' + this.textureHeight() +
            '&LAYERS=Agea2020_RGB' +
            '&STYLES=' +
            '&FORMAT=image%2Fpng' +
            '&DPI=96' +
            '&MAP_RESOLUTION=96' +
            '&FORMAT_OPTIONS=dpi%3A96' +
            '&TRANSPARENT=TRUE';

        // Compose WMS request URL for geology
        const WMSurlGEO = 'https://servizigis.regione.emilia-romagna.it/wms/geologia10k?' +
            'SERVICE=WMS&' +
            'VERSION=1.3.0' +
            '&REQUEST=GetMap' +
            '&BBOX=' + encodeURIComponent(BBox.join(',')) +
            '&CRS=' + encodeURIComponent(CRS) +
            '&WIDTH=' + this.textureWidth() +
            '&HEIGHT=' + this.textureHeight() +
            '&LAYERS=Unita_geologiche_10K' +
            '&STYLES=' +
            '&FORMAT=image%2Fpng' +
            '&DPI=96' +
            '&MAP_RESOLUTION=96' +
            '&FORMAT_OPTIONS=dpi%3A96' +
            '&TRANSPARENT=TRUE';

        // Load and apply DEM
        this.loadDEM(WCSurl);

        // Load and apply ortophoto, and store its blob URL
        this.loadWMS(WMSurl).then((url) => {
            this.applyTexture(url);
            this.OPurl = url;
        });

        // Load geology map, and store its blob URL
        this.loadWMS(WMSurlGEO).then((url) => {
            this.GEOurl = url;
        });

        // TODO catch errors
        // TODO loading indicator
    }

    async loadDEM(WCSurl: string) {
        // TODO: cache!

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

    // Function that loads png from WMS
    async loadWMS(url: string): Promise<string> {
        // Fetch WMS for orthophoto
        const myWMSResponse = await fetch(
            url,
            {
                cache: 'force-cache'
            }
        )
        const myBlob = await myWMSResponse.blob();
        const myBlobURL = URL.createObjectURL(myBlob);
        return myBlobURL;
        // Load texture
        // TODO catch errors
        // TODO loading indicator
    }

    // Function that apply texture to plane
    applyTexture(url: string) {
        const myTexture = new THREE.TextureLoader().load(url); // TODO callbacks (https://threejs.org/docs/#api/en/loaders/TextureLoader)

        if (!(this.mesh.material instanceof THREE.MeshLambertMaterial))
            throw new Error('Mesh material is not MeshLambertMaterial');

        // Apply texture
        this.mesh.material.map = myTexture;
        this.mesh.material.needsUpdate = true;
    }

    // Switch texture
    // geo = true --> geology map
    // geo = false --> orthophoto
    changeTexture(geo: boolean) {
        this.applyTexture(geo ? this.GEOurl : this.OPurl);

        if (!(this.mesh.material instanceof THREE.MeshLambertMaterial))
            throw new Error('Mesh material is not MeshLambertMaterial');

        this.mesh.material.flatShading = geo;
        this.mesh.material.needsUpdate = true;
    }

    // Reload DEM and textures with new coordinates
    reset(x = this.x, y = this.y) {
        this.x = x;
        this.y = y;
        this.load();
    }

}
