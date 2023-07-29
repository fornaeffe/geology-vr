import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh.js'
import { Tile } from './Tile';
import { VRFlyControls } from './VRFlyControls';
import { DeviceOrientationControls } from './DeviceOrientationControls';
import { WMSClient, WMSService } from './WMSClient';
import { FeatureCollection, GeoJsonObject } from 'geojson';


export type ViewMode = 'static' | 'device orientation' | 'VR'

export class GeoViewer {
    viewMode : ViewMode

    center : number[]
    center_id = [0, 0]
    CRS : string
    tileSide : number
    vertexResolution : number
    textureResolution : number

    renderer : THREE.WebGLRenderer
    scene : THREE.Scene
    camera : THREE.PerspectiveCamera
    light : THREE.DirectionalLight // the Sun
    blight : THREE.DirectionalLight // red light from bottom, in case the user goes underground
    
    tileSet : Tile[] = [] // Array of tiles

    myMapControls : MapControls
    myVRcontrols : VRFlyControls
    myDOControls : DeviceOrientationControls

    // Are we showing the geology map?
    // true: geology map
    // false: orthophoto
    // TODO: remove this when better UI for VR will be in place
    geo : boolean

    // GUI mesh
    featureInfoDOMelement : HTMLElement
    guiDOMelement : HTMLElement
    guiMesh? : HTMLMesh

    // WMS services
    WMSservices : WMSService[] = []

    // Function (to be passed) that will be executed when a view mode change is triggered inside this class (and not by user input or UI logic)
    onAutomaticViewModeChange = (v : ViewMode) => {}

    // TODO pass parameters as oject
    constructor(
        {
            center = [612400, 4919216],
            CRS = 'EPSG:32632',
            tileSide = 2000,
            vertexResolution = 10,
            textureResolution = 2,
            guiDOMelement = document.createElement('div'), 
            featureInfoDOMelement = document.createElement('div') 
        }: { 
            center?: number[];
            CRS?: string;
            tileSide?: number;
            vertexResolution?: number;
            textureResolution?: number;
            guiDOMelement?: HTMLElement; 
            featureInfoDOMelement?: HTMLElement; 
        } = {}
    ) {
        this.center = center
        this.CRS = CRS
        this.tileSide = tileSide
        this.vertexResolution = vertexResolution
        this.textureResolution = textureResolution
        
        this.viewMode = 'static'

        this.guiDOMelement = guiDOMelement
        this.featureInfoDOMelement = featureInfoDOMelement

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

        // Create tiles
        this.createTiles();

        // When central tile DEM is loaded, resets camera position
        const centralTile = this.tileSet.find((tile) => tile.x_id == 0 && tile.y_id == 0)
        if (centralTile) centralTile.onDEMLoad = () => this.resetCameraPosition()

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
        // TODO reorganize this section
        this.myVRcontrols.controllers.forEach((c) => {

            const lineGeometry = new THREE.BufferGeometry()
            lineGeometry.setFromPoints([ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 3000 ) ]) //TODO: change hardcoded line length
            const lineMaterial = new THREE.LineBasicMaterial()
            lineMaterial.opacity = .5
            const line = new THREE.Line(lineGeometry, lineMaterial)
            
            
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
                        if (this.guiMesh) {
                            console.log('Rimuovo GUI')
                            this.removeGui()
                        } else {
                            console.log('Aggiungo GUI')
                            this.addGui(this.guiDOMelement)
                        }

                }
            })
            c.addEventListener('pressend', (e) => {
                switch (e.data) {
                    case 0:
                        const raycaster = new THREE.Raycaster()
                        raycaster.ray.origin.setFromMatrixPosition(c.targetRaySpace.matrixWorld)
                        raycaster.ray.direction.set(0,0,-1).applyMatrix4( new THREE.Matrix4().identity().extractRotation(c.targetRaySpace.matrixWorld) )

                        const meshes : THREE.Mesh[] = this.getTileMeshes()
                        
                        if (this.guiMesh)
                            meshes.push(this.guiMesh)

                        const intersections = raycaster.intersectObjects(meshes)

                        if (intersections.length < 1)
                            return;

                        const intersection = intersections[0]

                        const uv = intersection.uv

                        if (uv) {
                            intersection.object.dispatchEvent({type: 'click', data: new THREE.Vector2(uv.x, 1-uv.y)})
                        }

                }
            })
        })

        // On squeeze click: change texture
        // TODO: better controls for texture change in VR
        this.renderer.xr.getController(0).addEventListener('squeezestart', (e) => {           

            this.changeTexture()
        })

        // const guiMesh = new HTMLMesh( vrGUI )

        // const c0space = this.myVRcontrols.controllers[0].gripSpace

        // guiMesh.position.x = c0space.position.x + .25
        // guiMesh.position.y = c0space.position.y
        // guiMesh.position.z = c0space.position.z
        // guiMesh.rotateOnAxis(new THREE.Vector3(1,0,0), -Math.PI/2)
        // c0space.add(guiMesh)

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

        // Texture loading
        const client = new WMSClient()
        client.connect('https://servizigis.regione.emilia-romagna.it/wms/agea2020_rgb').then((service) => {
            this.WMSservices.push(service)
            this.tileSet.forEach((tile) => tile.applyTexture(service, 'Agea2020_RGB', false))
        })
        client.connect('https://servizigis.regione.emilia-romagna.it/wms/geologia10k').then((service) => {
            this.WMSservices.push(service)
        })

        // Start animation
        this.renderer.setAnimationLoop(() => this.render())

        // Call resize() if window resizes
        window.addEventListener('resize', () => this.resize());

        // Starts with orthophoto
        // TODO: remove this when no longer needed by VR
        this.geo = false

        this.addGui(this.guiDOMelement)

        
    }

    private getTileMeshes(): THREE.Mesh<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.Material | THREE.Material[]>[] {
        return this.tileSet.map((t) => t.mesh);
    }

    private createTiles() {
        for (let i = this.center_id[0] - 1; i < this.center_id[0] + 2; i++) {
            for (let j = this.center_id[1] - 1; j < this.center_id[1] + 2; j++) {
                // check if tile exist
                if (this.tileSet.some((tile) => tile.x_id == i && tile.y_id == j))
                    continue

                const tile = new Tile({
                    x_id: i,
                    y_id: j,
                    x: this.center[0] + i * this.tileSide,
                    y: this.center[1] + j * this.tileSide,
                    CRS: this.CRS,
                    width: this.tileSide,
                    height: this.tileSide,
                    vertexResolution: this.vertexResolution,
                    textureResolution: this.textureResolution
                });

                this.scene.add(tile.mesh);
                this.tileSet.push(tile);

                // Feature Info event listener
                tile.addEventListener('featureinfo', (e) => {
            
                    // Remove open GUI if one
                    this.removeGui()
        
                    // Clear previous feature info content
                    this.featureInfoDOMelement.innerHTML = ''
        
                    const geojson = e.data as FeatureCollection
                    
                    geojson.features.forEach((feature) => {
                        const featureDIV = document.createElement('div')
                        featureDIV.classList.add('feature')
        
                        const props = feature.properties
        
                        if (!props) return;
        
                        for (const [key, value] of Object.entries(props)) {
                            
                            featureDIV.innerHTML += '<span class="featurepropname">' + key + ': </span>' + addNewlines(value)
                        }
        
                        this.featureInfoDOMelement.appendChild(featureDIV)
        
                        // TODO make this better (or, better, change VR GUI engine)
                        function addNewlines(str: string) {
                            var result = '';
                            while (str.length > 0) {
                              result += str.substring(0, 80) + '<br />';
                              str = str.substring(80);
                            }
                            return result;
                          }
                    })
                    
        
                    // Show info GUI
                    this.addGui(this.featureInfoDOMelement)
                })
            }
        }
    }

    render() {
        if (this.viewMode == 'VR') {
            this.checkTranslation();
        }

        this.myVRcontrols.update()
        this.renderer.render( this.scene, this.camera )
    }

    // Check if VR camera is near limit of tileset, and in that case move the tileset
    private checkTranslation() {

        // Calculate needed translation
        const xrCameraPosition = this.renderer.xr.getCamera().position
        const translation = [
            Math.trunc(xrCameraPosition.x / this.tileSide - this.center_id[0]),
            Math.trunc(- xrCameraPosition.z / this.tileSide - this.center_id[1])
        ];

        // If no translation needed, do nothing
        if (translation[0] == 0 && translation[1] == 0)
            return;
        
        // Change center of tileset
        this.center_id = [this.center_id[0] + translation[0], this.center_id[1] + translation[1]]

        // Create new tiles
        this.createTiles()

        // Remove tiles far from camera
        this.tileSet.forEach((tile) => {
            if (
                tile.x_id > this.center_id[0] + 1 ||
                tile.x_id < this.center_id[0] - 1 ||
                tile.y_id > this.center_id[1] + 1 ||
                tile.y_id < this.center_id[1] - 1
            ) {
                this.scene.remove(tile.mesh)
                tile.material.dispose()
                tile.geometry.dispose()
            }
        })
        this.tileSet = this.tileSet.filter((tile) => {
            const trueOrFalse = !(tile.x_id > this.center_id[0] + 1 ||
            tile.x_id < this.center_id[0] - 1 ||
            tile.y_id > this.center_id[1] + 1 ||
            tile.y_id < this.center_id[1] - 1)
            
            return trueOrFalse
        })
        
        
        // Update textures for all tiles
        this.changeTexture(this.geo)
    }

    // geo: true if we want geology map, false if we want orthophoto
    changeTexture(geo = !this.geo) {
        const service = this.WMSservices.find((service) => service.baseURL == (geo ? 'https://servizigis.regione.emilia-romagna.it/wms/geologia10k' : 'https://servizigis.regione.emilia-romagna.it/wms/agea2020_rgb'))
        
        if (!service) {
            console.warn('Change texture called with geo = ' + geo + ' before the service is available.')
            return
        }

        const layerName = geo ? 'Unita_geologiche_10K' : 'Agea2020_RGB'
        
        this.tileSet.forEach((tile) => tile.applyTexture(service, layerName, geo))

        this.geo = geo
    }

    // Reset tiles
    reset(center = this.center) {

        // Remove previous tiles
        this.tileSet.forEach((tile) => {
            this.scene.remove(tile.mesh)
            tile.material.dispose()
            tile.geometry.dispose()
        })
        
        // Update center of scene
        this.center = center
        this.center_id = [0, 0]

        // Reset tileSet and create new tiles
        this.tileSet = []
        this.createTiles()

        // When central tile DEM is loaded, resets camera position
        const centralTile = this.tileSet.find((tile) => tile.x_id == 0 && tile.y_id == 0)
        if (centralTile) centralTile.onDEMLoad = () => this.resetCameraPosition()

        const service = this.WMSservices.find((service) => service.baseURL == 'https://servizigis.regione.emilia-romagna.it/wms/agea2020_rgb')

        if (!service) return;
        
        this.tileSet.forEach((tile) => tile.applyTexture(service, 'Agea2020_RGB', false))
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
        const intersections = myRaycaster.intersectObjects(this.getTileMeshes())
    
        if (intersections.length < 1)
            return;
        
        // static mode: camera far above the map, looking down
        // mobile or VR mode: camera near the surface, direction controlled by the device
        const y = intersections[0].point.y + (this.viewMode == 'static' ? this.tileSide / 2 : 5)
    
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

    addGui(htmlElement : HTMLElement) {
        const c0 = this.myVRcontrols.controllers[0].gripSpace
        this.guiMesh = new HTMLMesh(htmlElement)
        // this.guiMesh.position.copy(c0.position)
        // this.guiMesh.quaternion.copy(c0.quaternion)
        this.guiMesh.translateX(0.2)
        this.guiMesh.translateZ(-0.4)
        this.guiMesh.rotateX(- Math.PI / 2 * 0.7)
        c0.add(this.guiMesh)

    }

    removeGui() {
        if (!this.guiMesh)
            return;

        this.myVRcontrols.controllers[0].gripSpace.remove(this.guiMesh)
        this.guiMesh.dispose()
        this.guiMesh = undefined
    }
    
}