import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import proj4 from 'proj4';
import { GeoViewer, ViewMode } from './GeoViewer';


// Initialize the viewer
const myGeoViewer = new GeoViewer()

// Append the renderer and the VR button to the page
document.body.appendChild( myGeoViewer.renderer.domElement )

const myVRButton = VRButton.createButton( myGeoViewer.renderer )
myVRButton.style.position = 'static'
document.getElementById('device-list').appendChild( myVRButton )

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
    myGeoViewer.changeTexture(false)
})
document.getElementById('geo').addEventListener('click', (e) => {
    myGeoViewer.changeTexture(true)
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

    myGeoViewer.myTile.reset(coordsUTM[0], coordsUTM[1])
    
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
            myGeoViewer.changeViewMode('static')

            deviceButton.innerHTML = 'computer'
            break
        case 'device orientation':
            myGeoViewer.changeViewMode('device orientation')

            deviceButton.innerHTML = 'smartphone'
            break

    }
}

myGeoViewer.onAutomaticViewModeChange = (viewMode) => {
    switch (viewMode) {
        case 'static':
            deviceButton.innerHTML = 'computer'
            break
        case 'device orientation':
            deviceButton.innerHTML = 'smartphone'
            break

    }
}