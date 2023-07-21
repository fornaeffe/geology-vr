import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { Tile } from './Tile';
import { VRFlyControls } from './VRFlyControls';
import { DeviceOrientationControls } from './DeviceOrientationControls';


export type ViewMode = 'static' | 'device orientation' | 'VR'

export class GeoViewer {
    viewMode : ViewMode

    renderer : THREE.WebGLRenderer
    scene : THREE.Scene
    camera : THREE.PerspectiveCamera
    light : THREE.DirectionalLight
    blight : THREE.DirectionalLight
    myTile : Tile

    controls : MapControls
    myVRcontrols : VRFlyControls
    DOCcontrols : DeviceOrientationControls

    geo : boolean

    onAutomaticViewModeChange = (v : ViewMode) => {}

    constructor() {
        this.viewMode = 'static'

        // Create the scene
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0x87CEEB) // TODO: fix color
        
        // Create the camera
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth*0.99 / window.innerHeight*0.99, 0.1, 10000)
    
        // Create light
        this.light = new THREE.DirectionalLight(0xffffff)
        this.light.position.set( -1, 2, -1 )
        this.scene.add( this.light );

        // Create bottomlight
        this.blight = new THREE.DirectionalLight(0x900000)
        this.blight.position.set( 0, -1, 0 ).normalize()
        this.scene.add( this.blight );

        // Create tile
        this.myTile = new Tile()
        this.myTile.onDEMLoad = () => this.resetCameraPosition()
        this.scene.add(this.myTile.mesh)

        // Create the renderer and enable XR
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth*0.99, window.innerHeight*0.99 );
        this.renderer.xr.enabled = true;

        // Create controls
        this.controls = new MapControls(this.camera, this.renderer.domElement)
        this.myVRcontrols = new VRFlyControls(this.renderer)
        this.DOCcontrols = new DeviceOrientationControls(this.camera)

        // If device orientation changes, disable map controls
        // and tell the change to parents
        this.DOCcontrols.onMovementDetected = () => {
            this.changeViewMode('device orientation')
            this.onAutomaticViewModeChange('device orientation')
        }

        // XR session initialization
        this.renderer.xr.addEventListener("sessionstart", (e) => {

            this.changeViewMode('VR')

            // TODO: better controls for texture change in VR
            this.renderer.xr.getController(0).addEventListener('squeezestart', (e) => {
                this.changeTexture()
            })

        })

        this.renderer.setAnimationLoop(() => {this.render()})

        this.geo = false
    }

    render() {
        this.myVRcontrols.update()
        this.renderer.render( this.scene, this.camera )
    }

    changeTexture(geo = !this.geo) {
        this.geo = geo
        this.myTile.changeTexture(geo)
    }

    changeViewMode(newViewMode : ViewMode) {
        switch (newViewMode) {
            case 'static':
                this.controls.enabled = true
    
                if (this.DOCcontrols.enabled) this.DOCcontrols.disconnect()
    
                break
            case 'device orientation':
                this.controls.enabled = false
    
                if (!this.DOCcontrols.enabled) this.DOCcontrols.connect()
    
                break
            case 'VR':
                if (this.DOCcontrols.enabled) this.DOCcontrols.disconnect()
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
        
        const y = intersections[0].point.y + (this.viewMode == 'static' ? this.myTile.width / 2 : 5)
    
        if (this.viewMode == 'VR') {
            // Move the plane below the observer
            const baseReferenceSpace = this.renderer.xr.getReferenceSpace()
            const myTransform = new XRRigidTransform({y: - y})
            const newReferenceSpace = baseReferenceSpace.getOffsetReferenceSpace(myTransform)
            this.renderer.xr.setReferenceSpace(newReferenceSpace)
        } else {
            this.camera.position.set(0,y,0)
        }
    
        if (this.viewMode == 'static')
            this.camera.lookAt(0,0,0)
        
    }
}