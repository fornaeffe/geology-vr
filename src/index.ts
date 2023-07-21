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

// Create controls
const controls = new MapControls(camera, renderer.domElement)
const myVRcontrols = new VRFlyControls(renderer)
const DOCcontrols = new DeviceOrientationControls(camera)


// If device orientation changes, disable map controls
DOCcontrols.onMovementDetected = () => {
    changeViewMode('device orientation')
}



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
document.body.appendChild( renderer.domElement )

const myVRButton = VRButton.createButton( renderer )
myVRButton.style.position = 'static'
document.getElementById('device-list').appendChild( myVRButton )



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

const layersButton = document.getElementById('layers-button')
const layersDialog = document.getElementById('layers-dialog')
layersButton.addEventListener('click', (e) => {
    innerMenu.classList.add('hiddenmenu')
    layersDialog.classList.remove('hiddenmenu')
})
layersDialog.firstElementChild.addEventListener('click', (e) => {
    layersDialog.classList.add('hiddenmenu')
})

const locationButton = document.getElementById('location-button')
const locationDialog = document.getElementById('location-dialog')
locationButton.addEventListener('click', (e) => {
    innerMenu.classList.add('hiddenmenu')
    locationDialog.classList.remove('hiddenmenu')
})
locationDialog.firstElementChild.addEventListener('click', (e) => {
    locationDialog.classList.add('hiddenmenu')
})

const deviceButton = document.getElementById('device-button')
const deviceDialog = document.getElementById('device-dialog')
deviceButton.addEventListener('click', (e) => {
    innerMenu.classList.add('hiddenmenu')
    deviceDialog.classList.remove('hiddenmenu')
})
deviceDialog.firstElementChild.addEventListener('click', (e) => {
    deviceDialog.classList.add('hiddenmenu')
})


document.getElementById('orthophoto').addEventListener('click', (e) => {
    myTile.changeTexture(false)
    geo = false
})
document.getElementById('geo').addEventListener('click', (e) => {
    myTile.changeTexture(true)
    geo = true
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
    
    locationDialog.classList.add('hiddenmenu')
})

const myLocationButton = document.getElementById('my-location')
if ("geolocation" in navigator) {
    myLocationButton.addEventListener('click', (e) => {
        navigator.geolocation.getCurrentPosition(
            geolocationSuccess,
            geolocationError,
            {
                enableHighAccuracy: true
            }
        )
    })
} else {
    myLocationButton.remove()
}

function geolocationSuccess(position : GeolocationPosition) {
    const lat = position.coords.latitude
    const lon = position.coords.longitude
    coordInput.value = lat + ", " + lon
}

function geolocationError(error: GeolocationPositionError) {
    console.error(error)
}

const computerButton = document.getElementById('computer-button')
computerButton.addEventListener('click', (e) => {
    changeViewMode('static')
    deviceDialog.classList.add('hiddenmenu')
})
const mobileButton = document.getElementById('mobile-button')
mobileButton.addEventListener('click', (e) => {
    changeViewMode('device orientation')
    deviceDialog.classList.add('hiddenmenu')
})

function changeViewMode(newViewMode : ViewMode) {
    switch (newViewMode) {
        case 'static':
            controls.enabled = true

            if (DOCcontrols.enabled) DOCcontrols.disconnect()

            deviceButton.innerHTML = 'computer'
            break
        case 'device orientation':
            controls.enabled = false

            if (!DOCcontrols.enabled) DOCcontrols.connect()

            deviceButton.innerHTML = 'smartphone'
            break

    }
    viewMode = newViewMode
    resetCameraPosition()
}

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