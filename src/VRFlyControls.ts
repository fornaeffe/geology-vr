import * as THREE from 'three';
import { ExtendedController } from './ExtendedController';

// This class allows the user to fly around using controllers' thumbsticks
export class VRFlyControls {
    // renderer that contains xr session
    renderer: THREE.WebGLRenderer 
    controllers: ExtendedController[] = []

    // speed in m/s^2 when one thumbstick is 100% forward
    speedFactor = 30


    // seconds per frame
    // Don't know if it is really the fps whe have... Maybe we should get the real fps?
    secondsPerFrame = 1 / 60

    

    constructor(renderer: THREE.WebGLRenderer) {
        this.renderer = renderer

        // Create controllers
        for (let i = 0; i < 2; i++) {
            this.controllers[i] = new ExtendedController(renderer.xr, i)
        }
    }

    // To be called inside animation loop
    update() {

        // Check if session exists
        const session = this.renderer.xr.getSession()
        if (!session)
            return;

        // Update controllers
        this.controllers.forEach((c) => c.update())
        
        // Initialize velocity
        const velocity = new THREE.Vector3()

        // Get data from controllers
        this.controllers.forEach((c) => {
            
            if (!c.inputSource || !c.inputSource.gamepad || !c.inputSource.gamepad.axes[3])
                return;
            

            velocity.z += c.inputSource.gamepad.axes[3]
        })

        velocity.multiplyScalar(this.speedFactor * this.secondsPerFrame)
        velocity.applyQuaternion(this.renderer.xr.getCamera().quaternion)

        // MOVE OBSERVER
        // Get actual reference space
        const baseReferenceSpace = this.renderer.xr.getReferenceSpace()

        if (!baseReferenceSpace){
            console.error('No base reference space when moving observer')
            return
        }

        // Change reference space
        const myTransform = new XRRigidTransform(velocity.negate()) 
        const newReferenceSpace = baseReferenceSpace.getOffsetReferenceSpace(myTransform)
        this.renderer.xr.setReferenceSpace(newReferenceSpace)

    }

}

