import * as THREE from 'three';
import { XRControllerModelFactory, XRControllerModel } from 'three/examples/jsm/webxr/XRControllerModelFactory';
import { EventDispatcher } from './EventDispatcher';

export class ExtendedController extends EventDispatcher {

    targetRaySpace: THREE.XRTargetRaySpace
    gripSpace: THREE.XRGripSpace
    model: XRControllerModel
    inputSource?: XRInputSource

    private buttonState: GamepadButton[] = []

    constructor(xr: THREE.WebXRManager, id: number) {
        super()
        
        const controllerModelFactory = new XRControllerModelFactory()
         
        this.targetRaySpace = xr.getController(id)
        this.gripSpace = xr.getControllerGrip(id)
        this.model = controllerModelFactory.createControllerModel( this.gripSpace )
        this.gripSpace.add(this.model)

        this.targetRaySpace.addEventListener('connected', (e) => {
            if ( !e.data || !(e.data instanceof XRInputSource) ) 
                return;

            this.inputSource = e.data

            if (e.data.gamepad)
                Object.assign(this.buttonState, e.data.gamepad.buttons)
        })
        this.targetRaySpace.addEventListener('disconnected', (e) => {
            this.inputSource = null
            this.buttonState = []
        })
    }

    update() {
        if (!this.inputSource || !this.inputSource.gamepad)
            return;
        
        this.inputSource.gamepad.buttons.forEach((v, i) => {
            if (!this.buttonState[i])
                return

            if (!this.buttonState[i].pressed && v.pressed)
                this.dispatchEvent( { type: 'pressstart', data: i } )
            
            if (this.buttonState[i].pressed && !v.pressed)
                this.dispatchEvent( { type: 'pressend', data: i } )
            
            if (!this.buttonState[i].touched && v.touched)
                this.dispatchEvent( { type: 'touchstart', data: i } )
            
            if (this.buttonState[i].touched && !v.touched)
                this.dispatchEvent( { type: 'touchend', data: i } )
        })

        Object.assign(this.buttonState, this.inputSource.gamepad.buttons)
    }
}


