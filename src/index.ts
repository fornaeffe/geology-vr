import * as THREE from 'three';
// import {Text} from 'troika-three-text'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { VRFlyControls } from './VRFlyControls';
import proj4 from 'proj4';
import { DeviceOrientationControls } from './DeviceOrientationControls';
import { Tile } from './Tile';

type ViewMode = 'static' | 'device orientation' | 'VR'

let viewMode : ViewMode = 'static'


// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB)

// Create the camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth*0.99 / window.innerHeight*0.99, 0.1, 10000)
camera.position.set(0, 2, 0)
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
myTile.onDEMLoad = () => resetCameraPosition()
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

function resetCameraPosition() {
    // Find plane center height
    const myRaycaster = new THREE.Raycaster()
    myRaycaster.set(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0))
    const intersections = myRaycaster.intersectObject(myTile.mesh)

    if (intersections.length < 1)
        return;
    
    const y = intersections[0].point.y + (viewMode == 'static' ? myTile.width / 2 : 5)

    if (viewMode == 'VR') {
        // Move the plane below the observer
        const baseReferenceSpace = renderer.xr.getReferenceSpace()
        const myTransform = new XRRigidTransform({y: - y})
        const newReferenceSpace = baseReferenceSpace.getOffsetReferenceSpace(myTransform)
        renderer.xr.setReferenceSpace(newReferenceSpace)
    } else {
        camera.position.set(0,y,0)
    }

    if (viewMode == 'static')
        camera.lookAt(0,0,0)
    
}

// If device orientation changes, disable map controls
DOCcontrols.onMovementDetected = () => {
    controls.enabled = false
    controlSwitch.checked = true
    viewMode = 'device orientation'
}

// Control switch handling
controlSwitch.addEventListener('change', (e) => {
    if (controlSwitch.checked) {
        DOCcontrols.connect()
        controls.enabled = false
        viewMode = 'device orientation'
    } else {
        DOCcontrols.disconnect()
        controls.enabled = true
        viewMode = 'static'
    }
    resetCameraPosition()
})

// XR session initialization
renderer.xr.addEventListener("sessionstart", (e) => {

    // Switch off DOC controls
    if (DOCcontrols.enabled) DOCcontrols.disconnect()
    viewMode = 'VR'

    resetCameraPosition()

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

