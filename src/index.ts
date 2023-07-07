import * as THREE from 'three';
// import {Text} from 'troika-three-text'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { fromUrl  } from "geotiff";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VRFlyControls } from './VRFlyControls';

const CRS = 'EPSG:32632' // Coordinate reference system

// Lago Santo
// const x = 580239 // Easting of map center
// const y = 4917120 // Northing of map center

// Monte Fuso
// const x = 600799 // Easting of map center
// const y = 4929534 // Northing of map center

// Pietra di Bismantova
const x = 612400 // Easting of map center
const y = 4919216 // Northing of map center
const width = 4000 // Map width in m
const height = 3000 // Map height in m
const vertexResolution = 10 // Distance from vertices in m
const textureResolution = 2 // Texture pixel width in m

const widthSegments = Math.floor(width / vertexResolution) // Number of plane segments along width
const heightSegments = Math.floor(height / vertexResolution) // Number of plane vertices along height
const widthPoints = widthSegments + 1 // Number of plane vertices along width 
const heightPoints = heightSegments + 1 // Number of plane vertices along height
const textureWidth = Math.floor(width / textureResolution) // Pixel width of texture
const textureHeight = Math.floor(height / textureResolution) // Pixel heigth of texture

// Calculate bounding box
const BBox = [x - width /  2, y - height / 2, x + width / 2, y + height / 2]
const BBoxDEM = [x - (width + vertexResolution) /  2, y - (height + vertexResolution) / 2, x + (width + vertexResolution) / 2, y + (height + vertexResolution) / 2]

// Compose WCS request URL for DEM
let WCSurl = 'https://tinitaly.pi.ingv.it/TINItaly_1_1/wcs?' +
    'SERVICE=WCS' +
    '&VERSION=1.0.0' +
    '&REQUEST=GetCoverage' +
    '&FORMAT=GeoTIFF' +
    '&COVERAGE=TINItaly_1_1:tinitaly_dem' +
    '&BBOX=' + BBoxDEM.join(',') +
    '&CRS=' + CRS +
    '&RESPONSE_CRS=' + CRS +
    '&WIDTH='+ widthPoints +
    '&HEIGHT=' + heightPoints

// Compose WMS request URL for orthophoto
let WMSurl = 'https://servizigis.regione.emilia-romagna.it/wms/agea2020_rgb?' +
    'SERVICE=WMS&' +
    'VERSION=1.3.0' +
    '&REQUEST=GetMap' +
    '&BBOX=' + encodeURIComponent(BBox.join(',')) +
    '&CRS=' + encodeURIComponent(CRS) + 
    '&WIDTH=' + textureWidth +
    '&HEIGHT=' + textureHeight +
    '&LAYERS=Agea2020_RGB' +
    '&STYLES=' +
    '&FORMAT=image%2Fpng' +
    '&DPI=96' +
    '&MAP_RESOLUTION=96' +
    '&FORMAT_OPTIONS=dpi%3A96' +
    '&TRANSPARENT=TRUE'

// Compose WMS request URL for geology
let WMSurlGEO = 'https://servizigis.regione.emilia-romagna.it/wms/geologia10k?' +
    'SERVICE=WMS&' +
    'VERSION=1.3.0' +
    '&REQUEST=GetMap' +
    '&BBOX=' + encodeURIComponent(BBox.join(',')) +
    '&CRS=' + encodeURIComponent(CRS) + 
    '&WIDTH=' + textureWidth +
    '&HEIGHT=' + textureHeight +
    '&LAYERS=Unita_geologiche_10K' +
    '&STYLES=' +
    '&FORMAT=image%2Fpng' +
    '&DPI=96' +
    '&MAP_RESOLUTION=96' +
    '&FORMAT_OPTIONS=dpi%3A96' +
    '&TRANSPARENT=TRUE'



// Create the scene
const scene = new THREE.Scene();

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

// Create plane geometry
const myPlaneGeom = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments)
myPlaneGeom.rotateX(- Math.PI / 2)

// Create plane material
// const myMaterial = new THREE.MeshLambertMaterial({flatShading: true})
const myMaterial = new THREE.MeshLambertMaterial()
    myMaterial.color = new THREE.Color(0xa0a0a0)
    myMaterial.side = THREE.DoubleSide
    const myPlaneMesh = new THREE.Mesh(myPlaneGeom, myMaterial)
    scene.add(myPlaneMesh)


// Function that loads DEM
async function loadDEM() {
    // Fetch WCS GeoTIFF and read the raster data
    const myGeoTIFF = await fromUrl(WCSurl, {allowFullFile: true})
    const myGeoTIFFImage = await myGeoTIFF.getImage()
    const myRaster = await myGeoTIFFImage.readRasters()
    const myRasterData = myRaster[0]

    // Typeguard
    if (typeof myRasterData == 'number')
        throw new Error('myRaster[0] is a number, not a TypedArray')

    // Check if for every vertex in plane there is a data point in raster
    if (myRasterData.length != myPlaneGeom.attributes.position.count)
        throw new Error('raster length differs from plane points count')

    // Assing elevation for each vertex
    myRasterData.forEach((value, i) => {
        if (typeof value != 'number')
            throw new Error("raster values are not numbers");
            
        myPlaneGeom.attributes.position.setY(i, value)
    })
   
    // Update mesh
    myPlaneMesh.geometry.dispose()
    myPlaneMesh.geometry = myPlaneGeom

    // Update camera position
    const centralY = myRasterData[Math.floor(myRaster.length / 2)]
    if (typeof centralY != 'number')
            throw new Error("raster values are not numbers");    
    camera.translateY(centralY + 3000)
    camera.lookAt(0,0,0)

    // TODO catch errors
    // TODO loading indicator
    
}

// Function that loads png from WMS
async function loadWMS(url: string) : Promise<string> {
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
function applyTexture(url: string) {
    const myTexture = new THREE.TextureLoader().load(url) // TODO callbacks (https://threejs.org/docs/#api/en/loaders/TextureLoader)
    
    // Apply texture
    myPlaneMesh.material.map = myTexture
    myPlaneMesh.material.needsUpdate = true
}



// Create the renderer and enable XR
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth*0.99, window.innerHeight*0.99 );
renderer.xr.enabled = true;

// Create controls
const controls = new OrbitControls(camera, renderer.domElement)
const myVRcontrols = new VRFlyControls(renderer)

// XR session initialization
renderer.xr.addEventListener("sessionstart", (e) => {

    // Find plane center height
    const myRaycaster = new THREE.Raycaster()
    myRaycaster.set(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0))
    const intersections = myRaycaster.intersectObject(myPlaneMesh)

    if (intersections.length < 1)
        return;
    
    // Move the plane below the observer
    const baseReferenceSpace = renderer.xr.getReferenceSpace()
    const myTransform = new XRRigidTransform({y: - (intersections[0].point.y + 1.6)})
    const newReferenceSpace = baseReferenceSpace.getOffsetReferenceSpace(myTransform)
    renderer.xr.setReferenceSpace(newReferenceSpace)

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

// Load and apply DEM
loadDEM()

// Load and apply ortophoto, and store its blob URL
let OPurl = ''
loadWMS(WMSurl).then((url) => {
    applyTexture(url)
    OPurl = url
})

// Load geology map, and store its blob URL
let GEOurl = ''
loadWMS(WMSurlGEO).then((url) => {
    GEOurl = url
})

// Change between ortophoto and geology map
let geo = false

function changeTexture() {
    geo = !geo
    applyTexture( geo ? GEOurl : OPurl )
    myPlaneMesh.material.flatShading = geo
    myPlaneMesh.material.needsUpdate = true
}

renderer.domElement.addEventListener('auxclick', (ev) => {
    changeTexture()
})



