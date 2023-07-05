// import * as THREE from 'three';
// import {Text} from 'troika-three-text'
// import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { fromUrl  } from "geotiff";

const CRS = 'EPSG:32632'
const x = 580239
const y = 4917120
const width = 120
const height = 100
const mPerPixel = 20

// let myUrl = 'http://wms.pcn.minambiente.it/ogc?map=/ms_ogc/WMS_v1.3/raster/DTM_20M.map' + 
//     '&SERVICE=WMS' +
//     '&VERSION=1.3.0' + 
//     '&REQUEST=GetMap' +
//     '&BBOX=' + encodeURIComponent([(x - width / 2 * mPerPixel),(y - height / 2 * mPerPixel),(x + width / 2 * mPerPixel),(y + height / 2 * mPerPixel)].join(',')) +
//     '&CRS=' + encodeURIComponent(CRS) +
//     '&WIDTH=' + width +
//     '&HEIGHT=' + height +
//     '&LAYERS=EL.DTM.20M' +
//     '&STYLES=' +
//     '&FORMAT=image%2Fpng' +
//     '&DPI=96' +
//     '&MAP_RESOLUTION=96' +
//     '&FORMAT_OPTIONS=dpi%3A96' +
//     '&TRANSPARENT=TRUE'

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

// let WCSurl = 'https://wms.pcn.minambiente.it/wcs/dtm_20m?' + 
// '&SERVICE=WCS' +
// '&VERSION=1.0.0' + 
// '&REQUEST=GetCoverage' +
// '&FORMAT=GEOTIFF' +
// '&COVERAGE=EL.DTM.20M' +
// '&BBOX=' + [(x - width / 2 * mPerPixel),(y - height / 2 * mPerPixel),(x + width / 2 * mPerPixel),(y + height / 2 * mPerPixel)].join(',') +
// '&CRS=' + CRS +
// '&RESPONSE_CRS=' + CRS +
// '&WIDTH=' + width +
// '&HEIGHT=' + height

async function loadDEM() {
    const myGeoTIFF = await fromUrl(WCSurl, {allowFullFile: true})
    const myGeoTIFFImage = await myGeoTIFF.getImage()
    const myRaster = await myGeoTIFFImage.readRasters()
    console.log(myRaster)
}

const myA = document.createElement("a")
myA.href = WCSurl
myA.innerText = "Vai"
document.body.appendChild(myA)

loadDEM()


// const myUrlA = document.createElement("a")
// myUrlA.href = WCSurl
// myUrlA.innerText = 'Vai'
// document.body.appendChild(myUrlA)

// // Create the scene
// const scene = new THREE.Scene();

// // Create the camera
// const camera = new THREE.PerspectiveCamera()
// scene.add(camera)

// // Create the renderer and enable XR
// const renderer = new THREE.WebGLRenderer();
// renderer.setSize( window.innerWidth*0.99, window.innerHeight*0.99 );
// renderer.xr.enabled = true;

// // Append the renderer and the VR button to the page
// document.body.appendChild( renderer.domElement );
// document.body.appendChild( VRButton.createButton( renderer ) );

// // Rendering loop
// function render() {
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

//   renderer.render( scene, camera );
// }

// renderer.setAnimationLoop(render)