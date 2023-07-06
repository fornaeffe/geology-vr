import * as THREE from 'three';
// import {Text} from 'troika-three-text'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { fromUrl  } from "geotiff";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const CRS = 'EPSG:32632'
const x = 580239
const y = 4917120
const width = 120
const height = 100
const mPerPixel = 20

let WCSurl = 'https://tinitaly.pi.ingv.it/TINItaly_1_1/wcs?' +
    'SERVICE=WCS' +
    '&VERSION=1.0.0' +
    '&REQUEST=GetCoverage' +
    '&FORMAT=GeoTIFF' +
    '&COVERAGE=TINItaly_1_1:tinitaly_dem' +
    '&BBOX=' + [(x - width / 2 * mPerPixel),(y - height / 2 * mPerPixel),(x + width / 2 * mPerPixel),(y + height / 2 * mPerPixel)].join(',') +
    '&CRS=' + CRS +
    '&RESPONSE_CRS=' + CRS +
    '&WIDTH='+ width +
    '&HEIGHT=' + height

let WMSurl = 'https://servizigis.regione.emilia-romagna.it/wms/agea2020_rgb?' +
    'SERVICE=WMS&' +
    'VERSION=1.3.0' +
    '&REQUEST=GetMap' +
    '&BBOX=' + encodeURIComponent([(x - width / 2 * mPerPixel),(y - height / 2 * mPerPixel),(x + width / 2 * mPerPixel),(y + height / 2 * mPerPixel)].join(',')) +
    '&CRS=' + encodeURIComponent(CRS) + 
    '&WIDTH=' + width * 10 +
    '&HEIGHT=' + height * 10 +
    '&LAYERS=Agea2020_RGB' +
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

const axesHelper = new THREE.AxesHelper( 500 );
scene.add( axesHelper );

// Create light
const light = new THREE.DirectionalLight(0xffffff)
light.position.set( 1, 1, 1 )
scene.add( light );

// Create bottomlight
const blight = new THREE.DirectionalLight(0x900000)
blight.position.set( 0, -1, 0 ).normalize()
scene.add( blight );

const myPlaneGeom = new THREE.PlaneGeometry((width - 1) * mPerPixel, (height - 1) * mPerPixel, width - 1, height - 1)
myPlaneGeom.rotateX(- Math.PI / 2)

const myMaterial = new THREE.MeshLambertMaterial({flatShading: true})
    myMaterial.color = new THREE.Color(0xa0a0a0)
    myMaterial.side = THREE.DoubleSide
    const myPlaneMesh = new THREE.Mesh(myPlaneGeom, myMaterial)
    scene.add(myPlaneMesh)



async function loadDEM() {
    const myGeoTIFF = await fromUrl(WCSurl, {allowFullFile: true})
    const myGeoTIFFImage = await myGeoTIFF.getImage()
    const myRaster = await myGeoTIFFImage.readRasters()    

    const myRasterData = myRaster[0]

    if (typeof myRasterData == 'number')
        throw new Error('myRaster[0] is a number, not a TypedArray')

    if (myRasterData.length != myPlaneGeom.attributes.position.count)
        throw new Error('raster length differs from plane points count')

    
    myRasterData.forEach((value, i) => {
        if (typeof value != 'number')
            throw new Error("raster values are not numbers");
            
        myPlaneGeom.attributes.position.setY(i, value)
    })
   
    myPlaneMesh.geometry.dispose()
    myPlaneMesh.geometry = myPlaneGeom

    const centralY = myRasterData[Math.floor(myRaster.length / 2)]
    if (typeof centralY != 'number')
            throw new Error("raster values are not numbers");
    
    camera.translateY(centralY + 3000)
    camera.lookAt(0,0,0)

    // TODO catch errors
    // TODO loading indicator
    
}

async function loadOrthophoto() {
    const myWMSResponse = await fetch(WMSurl)
    const myBlob = await myWMSResponse.blob()
    const myBlobURL = URL.createObjectURL(myBlob)



    const myTexture = new THREE.TextureLoader().load(myBlobURL) // TODO callbacks (https://threejs.org/docs/#api/en/loaders/TextureLoader)
    
    myPlaneMesh.material.map = myTexture
    myPlaneMesh.material.needsUpdate = true

    // TODO catch errors
    // TODO loading indicator
}



// Create the renderer and enable XR
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth*0.99, window.innerHeight*0.99 );
renderer.xr.enabled = true;

// Create controls
const controls = new OrbitControls(camera, renderer.domElement)


// Append the renderer and the VR button to the page
document.body.appendChild( renderer.domElement );
document.body.appendChild( VRButton.createButton( renderer ) );

// Rendering loop
function render() {
//   const myXRsession = renderer.xr.getSession();

//   if (myXRsession) {

//     myXRsession.inputSources.forEach((mySource, i) => {

//       if (mySource.gamepad) {
//         mySource.gamepad.axes.forEach((axisValue, j) => {
//         })
//         mySource.gamepad.buttons.forEach((myButton, k) => {
//         })
//       }
//     })

//   }
  renderer.render( scene, camera );
}

renderer.setAnimationLoop(render)

loadDEM()
loadOrthophoto()