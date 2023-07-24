import * as THREE from 'three';
import { XRControllerModelFactory, XRControllerModel } from 'three/examples/jsm/webxr/XRControllerModelFactory';
import { EventDispatcher } from './EventDispatcher';

type ButtonState = {
    pressed: boolean,
    touched: boolean
}

export class ExtendedController extends EventDispatcher {

    targetRaySpace: THREE.XRTargetRaySpace
    gripSpace: THREE.XRGripSpace
    model: XRControllerModel
    inputSource?: XRInputSource

    private buttonState: ButtonState[] = []

    constructor(xr: THREE.WebXRManager, id: number) {
        super()
        
        const controllerModelFactory = new XRControllerModelFactory()
         
        this.targetRaySpace = xr.getController(id)
        this.gripSpace = xr.getControllerGrip(id)
        this.model = controllerModelFactory.createControllerModel( this.gripSpace )
        this.gripSpace.add(this.model)

        this.targetRaySpace.addEventListener('connected', (e) => {
            if ( !e.data || !(e.data instanceof XRInputSource) ) {
                console.error('Controller connected, but no input source')
                return;
            }

            this.inputSource = e.data

            if (e.data.gamepad) {
                e.data.gamepad.buttons.forEach((btn, i) => {
                    this.buttonState[i] = {
                        pressed: btn.pressed,
                        touched: btn.touched
                    }
                });
            }
        })
        this.targetRaySpace.addEventListener('disconnected', (e) => {
            this.inputSource = undefined
            this.buttonState = []
        })
    }

    update() {
        if (!this.inputSource || !this.inputSource.gamepad)
            return;
        
        this.inputSource.gamepad.buttons.forEach((btn, i) => {
            if (!this.buttonState[i]){
                console.error('Gamepad is present but buttonState not initialized when updating controller state')
                return
            }

            if (!this.buttonState[i].pressed && btn.pressed)
                this.dispatchEvent( { type: 'pressstart', data: i } )
            
            if (this.buttonState[i].pressed && !btn.pressed)
                this.dispatchEvent( { type: 'pressend', data: i } )
            
            if (!this.buttonState[i].touched && btn.touched)
                this.dispatchEvent( { type: 'touchstart', data: i } )
            
            if (this.buttonState[i].touched && !btn.touched)
                this.dispatchEvent( { type: 'touchend', data: i } )
            
            this.buttonState[i].pressed = btn.pressed
            this.buttonState[i].touched = btn.touched
            
        })

    }
}


