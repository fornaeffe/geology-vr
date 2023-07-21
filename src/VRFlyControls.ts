import * as THREE from 'three';

// This class allows the user to fly around using controllers' thumbsticks
export class VRFlyControls {
    // renderer that contains xr session
    renderer: THREE.WebGLRenderer 

    // speed in m/s^2 when one thumbstick is 100% forward
    speedFactor = 30


    // seconds per frame
    // Don't know if it is really the fps whe have... Maybe we should get the real fps?
    secondsPerFrame = 1 / 60

    

    constructor(renderer: THREE.WebGLRenderer) {
        this.renderer = renderer
    }

    // To be called inside animation loop
    update() {

        // Check if session exists
        const session = this.renderer.xr.getSession()
        if (!session)
            return;

        
        // Initialize velocity
        const velocity = new THREE.Vector3()

        // Get data from controllers
        session.inputSources.forEach((myInputSource) => {
            if (!myInputSource.gamepad)
                return;
            
            
            if (!myInputSource.gamepad.axes[3])
                return;
            
            velocity.z += myInputSource.gamepad.axes[3]            

        })

        velocity.multiplyScalar(this.speedFactor * this.secondsPerFrame)
        velocity.applyQuaternion(this.renderer.xr.getCamera().quaternion)

        // MOVE OBSERVER
        // Get actual reference space
        const baseReferenceSpace = this.renderer.xr.getReferenceSpace()
        // Change reference space
        const myTransform = new XRRigidTransform(velocity.negate()) 
        const newReferenceSpace = baseReferenceSpace.getOffsetReferenceSpace(myTransform)
        this.renderer.xr.setReferenceSpace(newReferenceSpace)

        return

    }

}

