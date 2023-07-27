import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup.js'
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh.js'
import { Tile } from './Tile';
import { VRFlyControls } from './VRFlyControls';
import { DeviceOrientationControls } from './DeviceOrientationControls';


export type ViewMode = 'static' | 'device orientation' | 'VR'

export class GeoViewer {
    viewMode : ViewMode

    renderer : THREE.WebGLRenderer
    scene : THREE.Scene
    camera : THREE.PerspectiveCamera
    light : THREE.DirectionalLight // the Sun
    blight : THREE.DirectionalLight // red light from bottom, in case the user goes underground
    myTile : Tile // model of the Earth surface

    myMapControls : MapControls
    myVRcontrols : VRFlyControls
    myDOControls : DeviceOrientationControls

    // Are we showing the geology map?
    // true: geology map
    // false: orthophoto
    // TODO: remove this when better UI for VR will be in place
    geo : boolean


    // Function (to be passed) that will be executed when a view mode change is triggered inside this class (and not by user input or UI logic)
    onAutomaticViewModeChange = (v : ViewMode) => {}

    constructor(vrGUI : HTMLElement = document.createElement('div')) {
        this.viewMode = 'static'

        // Create the scene
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0x87CEEB) // TODO: fix color
        
        // Create the camera
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth*0.99 / window.innerHeight*0.99, 0.1, 10000)
    
        // Create sun light
        this.light = new THREE.DirectionalLight(0xffffff)
        this.light.position.set( 1, 2, 1 )
        this.scene.add( this.light );

        // Create light from bottom
        this.blight = new THREE.DirectionalLight(0x900000)
        this.blight.position.set( 0, -1, 0 ).normalize()
        this.scene.add( this.blight );

        // Create tile
        this.myTile = new Tile()        
        // When the DEM is loaded, resets camera position
        this.myTile.onDEMLoad = () => this.resetCameraPosition()
        this.scene.add(this.myTile.mesh)

        // Create the renderer and enable XR
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth*0.99, window.innerHeight*0.99 );
        this.renderer.xr.enabled = true;

        // Create controls
        this.myMapControls = new MapControls(this.camera, this.renderer.domElement)
        this.myVRcontrols = new VRFlyControls(this.renderer)
        this.myDOControls = new DeviceOrientationControls(this.camera)

        // If device orientation changes, disable map controls
        // and tell the change to parents
        this.myDOControls.onSensorDetected = () => {
            this.changeViewMode('device orientation')
            this.onAutomaticViewModeChange('device orientation')
        }

        // VR controller event handlers
        this.myVRcontrols.controllers.forEach((c) => {

            const lineGeometry = new THREE.BufferGeometry()
            lineGeometry.setFromPoints([ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 3000 ) ]) //TODO: change hardcoded line length
            const line = new THREE.Line(lineGeometry)
            
            c.addEventListener('touchstart', (e) => {
                switch (e.data) {
                    case 0:
                        c.targetRaySpace.add(line)
                }
            })
            c.addEventListener('touchend', (e) => {
                switch (e.data) {
                    case 0:
                        c.targetRaySpace.remove(line)
                }
            })
            c.addEventListener('pressstart', (e) => {
                switch (e.data) {
                    case 4:
                        guiMesh.visible = !guiMesh.visible
                }
            })
            c.addEventListener('pressend', (e) => {
                switch (e.data) {
                    case 0:
                        const raycaster = new THREE.Raycaster()
                        raycaster.ray.origin.setFromMatrixPosition(c.targetRaySpace.matrixWorld)
                        raycaster.ray.direction.set(0,0,-1).applyMatrix4( new THREE.Matrix4().identity().extractRotation(c.targetRaySpace.matrixWorld) )

                        const intersections = raycaster.intersectObjects([this.myTile.mesh, guiMesh])

                        if (intersections.length < 1)
                            return;

                        const intersection = intersections[0]

                        const uv = intersection.uv

                        if (intersection.object === guiMesh && uv) {
                            guiMesh.dispatchEvent({type: 'click', data: new THREE.Vector2(uv.x, 1 - uv.y)})
                        }

                        // if (uv)
                        //     str += ' at<br />x = ' + uv.x + '<br />y = ' + uv.y
                        
                        // TODO code to getfeaturerequest

                }
            })
        })

        // On squeeze click: change texture
        // TODO: better controls for texture change in VR
        this.renderer.xr.getController(0).addEventListener('squeezestart', (e) => {           

            this.changeTexture()
        })

        // const gui = document.createElement('div')
        // gui.innerText = 'Ciao!'
        // gui.style.color = 'black'
        // gui.style.background = '#cccccc'
        // gui.style.width = '150px'
        // gui.style.height = '150px'
        // document.body.appendChild(gui)
        // gui.style.position = 'fixed'
        // gui.style.visibility = 'hidden'
        
  
        const guiMesh = new HTMLMesh( vrGUI )

        const c0space = this.myVRcontrols.controllers[0].gripSpace

        guiMesh.position.x = c0space.position.x + .25
        guiMesh.position.y = c0space.position.y
        guiMesh.position.z = c0space.position.z
        guiMesh.rotateOnAxis(new THREE.Vector3(1,0,0), -Math.PI/2)
        c0space.add(guiMesh)

        this.myVRcontrols.controllers.forEach((c) => {
            this.scene.add(c.gripSpace, c.targetRaySpace)
        })

        // XR session initialization
        this.renderer.xr.addEventListener("sessionstart", (e) => {

            this.changeViewMode('VR')
        })
        this.renderer.xr.addEventListener('sessionend', (e) => {
            this.changeViewMode('static')
            this.onAutomaticViewModeChange('static')
        })

        // Start animation
        this.renderer.setAnimationLoop(() => this.render())

        // Call resize() if window resizes
        window.addEventListener('resize', () => this.resize());

        // Starts with orthophoto
        // TODO: remove this when no longer needed by VR
        this.geo = false
    }

    render() {
        this.myVRcontrols.update()
        this.renderer.render( this.scene, this.camera )
    }

    // geo: true if we want geology map, false if we want orthophoto
    changeTexture(geo = !this.geo) {
        this.geo = geo
        this.myTile.changeTexture(geo)
    }

    // Change the view mode (computer, mobile or VR)
    changeViewMode(newViewMode : ViewMode) {
        switch (newViewMode) {
            case 'static':
                this.myMapControls.enabled = true
    
                if (this.myDOControls.enabled) this.myDOControls.disconnect()
    
                break
            case 'device orientation':
                this.myMapControls.enabled = false
    
                if (!this.myDOControls.enabled) this.myDOControls.connect()
    
                break
            case 'VR':
                if (this.myDOControls.enabled) this.myDOControls.disconnect()
        }
        this.viewMode = newViewMode
        this.resetCameraPosition()
    }

    resetCameraPosition() {
        // Find plane center height
        const myRaycaster = new THREE.Raycaster()
        myRaycaster.set(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0))
        const intersections = myRaycaster.intersectObject(this.myTile.mesh)
    
        if (intersections.length < 1)
            return;
        
        // static mode: camera far above the map, looking down
        // mobile or VR mode: camera near the surface, direction controlled by the device
        const y = intersections[0].point.y + (this.viewMode == 'static' ? this.myTile.width / 2 : 5)
    
        if (this.viewMode == 'VR') {
            // Move the plane below the observer
            const baseReferenceSpace = this.renderer.xr.getReferenceSpace()

            if (!baseReferenceSpace){
                console.error('No base reference space in resetting camera position')
                return
            }

            const myTransform = new XRRigidTransform({y: - y})
            const newReferenceSpace = baseReferenceSpace.getOffsetReferenceSpace(myTransform)
            this.renderer.xr.setReferenceSpace(newReferenceSpace)
        } else {
            // Place the camera
            this.camera.position.set(0,y,0)
        }
    
        if (this.viewMode == 'static')
            this.camera.lookAt(0,0,0)
        
    }

    resize() {			
        const width = window.innerWidth * 0.99
        const height = window.innerHeight * 0.99
        const aspect_ratio = width / height
        this.renderer.setSize( width, height )
        this.camera.aspect = aspect_ratio
        this.camera.updateProjectionMatrix()
    }
    

    
}