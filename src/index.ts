import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import proj4 from 'proj4';
import { GeoViewer, ViewMode } from './GeoViewer';

function safeGet(id : string) {
    const element = document.getElementById(id)

    if (!element)
        throw new TypeError(id + ' not found in DOM')
    
    return element
}

function safeGetInput(id : string) {
    const element = document.getElementById(id)

    if (!(element instanceof HTMLInputElement))
        throw new TypeError(id + ' is not HTMLInputElement')
    
    return element
}


// Initialize the viewer
const myGeoViewer = new GeoViewer(safeGet('vr-gui'))

safeGet('clickme').addEventListener('click', (e) => {
    safeGet('response').innerText = 'clicked at ' + e.offsetX + ' ' + e.offsetY
})

// Append the renderer and the VR button to the page
document.body.appendChild( myGeoViewer.renderer.domElement )

// Create the VRButton, but in a non default position (inside device dialog)
// TODO: find a nice icon for VR Button
const myVRButton = VRButton.createButton( myGeoViewer.renderer )
myVRButton.style.position = 'static'


// Menu
const menuButton = safeGet("menubutton")
const innerMenu = safeGet("innermenu")


menuButton.addEventListener('click', (e) => {
    innerMenu.classList.toggle('hiddenmenu')
})

// TODO rewrite this all with React, or similar...
// ------------------------- Layers dialog ---------------------------------
const layersButton = safeGet('layers-button')
const layersDialog = safeGet('layers-dialog')

// Open dialog
layersButton.addEventListener('click', (e) => {
    innerMenu.classList.add('hiddenmenu')
    layersDialog.classList.remove('hiddenmenu')
})

// Close dialog
layersDialog.firstElementChild?.addEventListener('click', (e) => {
    layersDialog.classList.add('hiddenmenu')
})

// TODO add more texture layers
// Available textures
document.getElementById('orthophoto')?.addEventListener('click', (e) => {
    myGeoViewer.changeTexture(false)
})
document.getElementById('geo')?.addEventListener('click', (e) => {
    myGeoViewer.changeTexture(true)
})


// ---------------------------- Location dialog ------------------------------

let geolocationWatcher : number | undefined // Geolocation watcher ID

const locationButton = safeGet('location-button')
const locationDialog = safeGet('location-dialog')
const coordInput = safeGet('coords') as HTMLInputElement
const GOButton = safeGet("gobutton")
const accuracyDiv = safeGet('accuracy')

// Open dialog
locationButton.addEventListener('click', (e) => {
    innerMenu.classList.add('hiddenmenu')
    locationDialog.classList.remove('hiddenmenu')
})

// Close dialog
locationDialog.firstElementChild?.addEventListener('click', (e) => {
    locationDialog.classList.add('hiddenmenu')

    // Stop geolocation watcher if started
    if (geolocationWatcher) {
        navigator.geolocation.clearWatch(geolocationWatcher)
        geolocationWatcher = undefined
    }

    // Clear input and accuracy values
    coordInput.value = ""
    accuracyDiv.innerText = ""
})

// WGS 84 / UTM zone 32N projection definition for coordinates translation
proj4.defs("EPSG:32632","+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs +type=crs")

// Read coordinates and reload DEM and textures
GOButton.addEventListener('click', (e) => {
    const coords = coordInput.value.split(", ").map((str) => parseFloat(str))
    
    if (coords.length != 2) {
        window.alert('Wrong coordinates input')
        return
    }

    const coordsUTM = proj4('WGS84', 'EPSG:32632', coords.reverse())

    myGeoViewer.myTile.reset(coordsUTM[0], coordsUTM[1])
    
    // If all ok, close the dialog
    locationDialog.classList.add('hiddenmenu')

    // Stop geolocation watcher if started
    if (geolocationWatcher) {
        navigator.geolocation.clearWatch(geolocationWatcher)
        geolocationWatcher = undefined
    }

    // Clear input and accuracy values
    coordInput.value = ""
    accuracyDiv.innerText = ""
})

// My location button
const myLocationButton = safeGet('my-location')
if ("geolocation" in navigator) {
    myLocationButton.addEventListener('click', (e) => {

        // If already watching, do nothing
        if (geolocationWatcher)
            return;

        // Start reading position
        geolocationWatcher = navigator.geolocation.watchPosition(
            geolocationSuccess,
            geolocationError,
            {
                enableHighAccuracy: true
            }
        )
    })
} else {
    // Don't show my location button if geolocation is not available
    myLocationButton.remove()
}

// This is called at every geolocation fix
function geolocationSuccess(position : GeolocationPosition) {
    const lat = position.coords.latitude
    const lon = position.coords.longitude

    // Insert coords in text field
    coordInput.value = lat + ", " + lon

    // Show accuracy
    accuracyDiv.innerText = "Accuracy: " + position.coords.accuracy.toFixed(0) + " m"
}

// TODO: show error to user
function geolocationError(error: GeolocationPositionError) {
    console.error(error)
}


// --------------- Device dialog ----------------------
const deviceButton = safeGet('device-button')
const deviceDialog = safeGet('device-dialog')
const deviceList = safeGet('device-list')

deviceList.appendChild( myVRButton )

// Open dialog
deviceButton.addEventListener('click', (e) => {
    innerMenu.classList.add('hiddenmenu')
    deviceDialog.classList.remove('hiddenmenu')
})

// Close dialog
deviceDialog.firstElementChild?.addEventListener('click', (e) => {
    deviceDialog.classList.add('hiddenmenu')
})

// Device buttons: change view mode and close dialog
const computerButton = safeGet('computer-button')
computerButton.addEventListener('click', (e) => {
    changeViewMode('static')
    deviceDialog.classList.add('hiddenmenu')
})
const mobileButton = safeGet('mobile-button')
mobileButton.addEventListener('click', (e) => {
    changeViewMode('device orientation')
    deviceDialog.classList.add('hiddenmenu')
})


// Ask GeoViewer to change view mode and show the correct icon in menu
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

// If GeoViewer automatically change view mode, correct menu icon accordingly
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