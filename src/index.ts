import * as THREE from 'three';
// import {Text} from 'troika-three-text'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { fromUrl  } from "geotiff";
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { VRFlyControls } from './VRFlyControls';
import proj4 from 'proj4';
import { DeviceOrientationControls } from './DeviceOrientationControls';




class Tile {
    x: number // Easting of tile center
    y: number // Northing of tile center
    width: number // Tile width in m
    height: number // Tile height in m
    vertexResolution: number // Distance from vertices in m
    textureResolution: number // Texture pixel width in m
    CRS: string
    geometry: THREE.PlaneGeometry
    material: THREE.MeshLambertMaterial
    mesh: THREE.Mesh

    OPurl = '' // Orthophoto blob URL
    GEOurl = '' // Geology map blob URL

    constructor(
        x = 612400,
        y = 4919216,
        width = 4000,
        height = 3000,
        vertexResolution = 10,
        textureResolution = 2
    ) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.vertexResolution = vertexResolution
        this.textureResolution = textureResolution

        // Create tile geometry
        this.geometry = new THREE.PlaneGeometry(this.width, this.height, this.widthSegments(), this.heightSegments())
        this.geometry.rotateX(- Math.PI / 2)

        // Create tile material
        this.material = new THREE.MeshLambertMaterial()
        this.material.color = new THREE.Color(0xa0a0a0)
        this.material.side = THREE.DoubleSide

        // Create tile mesh
        this.mesh = new THREE.Mesh(this.geometry, this.material)

        this.load()
    }

    // Number of plane segments along width
    widthSegments() {
        return Math.floor(this.width / this.vertexResolution)
    }

    // Number of plane vertices along height
    heightSegments() {
        return Math.floor(this.height / this.vertexResolution)
    } 

    // Number of plane vertices along width 
    widthPoints() {
        return this.widthSegments() + 1
    }

    // Number of plane vertices along height
    heightPoints() {
        return this.heightSegments() + 1
    }

    // Pixel width of texture
    textureWidth() {
        return Math.floor(this.width / this.textureResolution)
    }
    
    // Pixel heigth of texture
    textureHeight() {
        return Math.floor(this.height / this.textureResolution) 
    }

    

    load() {
        const CRS = 'EPSG:32632' // Coordinate reference system

        // Calculate bounding box
        const BBox = [
            this.x - this.width /  2, 
            this.y - this.height / 2, 
            this.x + this.width / 2, 
            this.y + this.height / 2
        ]
        const BBoxDEM = [
            this.x - (this.width + this.vertexResolution) /  2,
            this.y - (this.height + this.vertexResolution) / 2,
            this.x + (this.width + this.vertexResolution) / 2,
            this.y + (this.height + this.vertexResolution) / 2
        ]

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
            '&WIDTH='+ this.widthPoints() +
            '&HEIGHT=' + this.heightPoints()

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
            '&TRANSPARENT=TRUE'

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
            '&TRANSPARENT=TRUE'

        // Load and apply DEM
        this.loadDEM(WCSurl)

        // Load and apply ortophoto, and store its blob URL
        this.loadWMS(WMSurl).then((url) => {
            this.applyTexture(url)
            this.OPurl = url
        })

        // Load geology map, and store its blob URL
        this.loadWMS(WMSurlGEO).then((url) => {
            this.GEOurl = url
        })

        // TODO catch errors
        // TODO loading indicator
    }

    async loadDEM(WCSurl: string) {
        // Fetch WCS GeoTIFF and read the raster data
        const myGeoTIFF = await fromUrl(WCSurl, {allowFullFile: true})
        const myGeoTIFFImage = await myGeoTIFF.getImage()
        const myRaster = await myGeoTIFFImage.readRasters()
        const myRasterData = myRaster[0]

        // Typeguard
        if (typeof myRasterData == 'number')
            throw new Error('myRaster[0] is a number, not a TypedArray')

        // Check if for every vertex in plane there is a data point in raster
        if (myRasterData.length != this.geometry.attributes.position.count)
            throw new Error('raster length differs from plane points count')

        // Assing elevation for each vertex
        myRasterData.forEach((value, i) => {
            if (typeof value != 'number')
                throw new Error("raster values are not numbers");
                
            this.geometry.attributes.position.setY(i, value)
        })
    
        // Update mesh
        this.mesh.geometry.dispose()
        this.mesh.geometry = this.geometry


        // TODO: Fix this!
        // Update camera position
        const centralY = myRasterData[Math.floor(myRaster.length / 2)]
        if (typeof centralY != 'number')
                throw new Error("raster values are not numbers");    
        camera.translateY(centralY + 3000)
        camera.lookAt(0,0,0)
    }

    // Function that loads png from WMS
    async loadWMS(url: string) : Promise<string> {
        // Fetch WMS for orthophoto
        const myWMSResponse = await fetch(url)
        const myBlob = await myWMSResponse.blob()
        const myBlobURL = URL.createObjectURL(myBlob)
        return myBlobURL
        // Load texture
        

        // TODO catch errors
        // TODO loading indicator

        
    }

    // Function that apply texture to plane
    applyTexture(url: string) {
        const myTexture = new THREE.TextureLoader().load(url) // TODO callbacks (https://threejs.org/docs/#api/en/loaders/TextureLoader)
        
        if (!(this.mesh.material instanceof THREE.MeshLambertMaterial))
            throw new Error('Mesh material is not MeshLambertMaterial');

        // Apply texture
        this.mesh.material.map = myTexture
        this.mesh.material.needsUpdate = true
    }

    changeTexture(geo: boolean) {
        this.applyTexture( geo ? this.GEOurl : this.OPurl )

        if (!(this.mesh.material instanceof THREE.MeshLambertMaterial))
            throw new Error('Mesh material is not MeshLambertMaterial');
        
        this.mesh.material.flatShading = geo
        this.mesh.material.needsUpdate = true
    }

    reset(x = this.x, y = this.y) {
        this.x = x
        this.y = y
        this.load()
    }
    
}





// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB)

// Create the camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth*0.99 / window.innerHeight*0.99, 0.1, 10000)
scene.add(camera)

// DEV: create axes Helper
const axesHelper = new THREE.AxesHelper( 500 );
scene.add( axesHelper );

// Create light
const light = new THREE.DirectionalLight(0xffffff)
light.position.set( -1, 2, -1 )
scene.add( light );

// Create bottomlight
const blight = new THREE.DirectionalLight(0x900000)
blight.position.set( 0, -1, 0 ).normalize()
scene.add( blight );

// Create tile
const myTile = new Tile()
scene.add(myTile.mesh)

// Create the renderer and enable XR
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth*0.99, window.innerHeight*0.99 );
renderer.xr.enabled = true;

// Control switch
const controlSwitch = document.getElementById('controlSwitch') as HTMLInputElement

// Create controls
const controls = new MapControls(camera, renderer.domElement)
const myVRcontrols = new VRFlyControls(renderer)
const DOCcontrols = new DeviceOrientationControls(camera)

// If device orientation changes, disable map controls
DOCcontrols.onMovementDetected = () => {
    controls.enabled = false
    controlSwitch.checked = true
}

// Control switch handling
controlSwitch.addEventListener('change', (e) => {
    if (controlSwitch.checked) {
        DOCcontrols.connect()
        controls.enabled = false
    } else {
        DOCcontrols.disconnect()
        controls.enabled = true
    }
})

// XR session initialization
renderer.xr.addEventListener("sessionstart", (e) => {

    // Switch off DOC controls
    DOCcontrols.disconnect()

    // Find plane center height
    const myRaycaster = new THREE.Raycaster()
    myRaycaster.set(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0))
    const intersections = myRaycaster.intersectObject(myTile.mesh)

    if (intersections.length < 1)
        return;
    
    // Move the plane below the observer
    const baseReferenceSpace = renderer.xr.getReferenceSpace()
    const myTransform = new XRRigidTransform({y: - (intersections[0].point.y + 1.6)})
    const newReferenceSpace = baseReferenceSpace.getOffsetReferenceSpace(myTransform)
    renderer.xr.setReferenceSpace(newReferenceSpace)

    renderer.xr.getController(0).addEventListener('squeezestart', (e) => {
        changeTexture()
    })

})

// Append the renderer and the VR button to the page
document.body.appendChild( renderer.domElement );
document.body.appendChild( VRButton.createButton( renderer ) );



// Rendering loop
function render() {
    myVRcontrols.update()
    renderer.render( scene, camera )
}

renderer.setAnimationLoop(render)



// Change between ortophoto and geology map
let geo = false

function changeTexture() {
    geo = !geo
    myTile.changeTexture(geo)
}

proj4.defs("EPSG:32632","+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs +type=crs");


// Menu
const menuButton = document.getElementById("menubutton")
const innerMenu = document.getElementById("innermenu")
menuButton.addEventListener('click', (e) => {
    innerMenu.classList.toggle('hiddenmenu')
})

const coordInput = document.getElementById('coords') as HTMLInputElement
const GOButton = document.getElementById("gobutton")
GOButton.addEventListener('click', (e) => {
    const coords = coordInput.value.split(", ").map((str) => parseFloat(str))
    
    if (coords.length != 2) {
        window.alert('Wrong coordinates input')
        return
    }

    const coordsUTM = proj4('WGS84', 'EPSG:32632', coords.reverse())

    myTile.reset(coordsUTM[0], coordsUTM[1])
})

const switchMapButton = document.getElementById('switchmapbutton')
switchMapButton.addEventListener('click', (e) => changeTexture())

