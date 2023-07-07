import * as THREE from 'three';

// This class allows the user to fly around using controllers' thumbsticks
export class VRFlyControls {
    // renderer that contains xr session
    renderer: THREE.WebGLRenderer 

    // User velocity vector in world space, in m/s
    velocity = new THREE.Vector3()

    // maximum acceleration in m/s^2
    maxAcceleration = 1

    // seconds per frame
    secondsPerFrame = 1 / 60

    // drag factor
    dragFactor = 3

    // speed under which the user will stop if not accelerated, in m/s
    minSpeed = 0.5

    constructor(renderer: THREE.WebGLRenderer) {
        this.renderer = renderer
    }

    // To be called inside animation loop
    update() {

        // Check if session exists
        const session = this.renderer.xr.getSession()
        if (!session)
            return;

        // // initialize acceleration vector, in m/s^2
        // const acceleration = new THREE.Vector3()

        // // Update acceleration with thumbsticks positions
        // session.inputSources.forEach((myInputSource) => {
        //     if (!myInputSource.gamepad)
        //         return;
            
        //     if (!myInputSource.gamepad.axes[3])
        //         return;
            
        //     acceleration.z += myInputSource.gamepad.axes[3]
        // })

        // // Align acceleration with user's head direction
        // acceleration.applyQuaternion(this.renderer.xr.getCamera().quaternion)

        // // Calculate drag
        // const drag = this.velocity.clone()
        // drag.multiplyScalar(-this.dragFactor)

        // // Sum acceleration and drag, and apply to velocity
        // acceleration.add(drag)
        // this.velocity.addScaledVector(acceleration, this.maxAcceleration * this.secondsPerFrame)

        // // If the speed is under the minimum and the user doesn't touch thumbsticks, stops it
        // if (acceleration.length() == 0 && this.velocity.length() < this.minSpeed ) {
        //     this.velocity.set(0, 0, 0)
        //     return
        // }
        
        // Initialize speed
        const speed = new THREE.Vector3()

        // Get data from controllers
        session.inputSources.forEach((myInputSource) => {
            if (!myInputSource.gamepad)
                return;
            
            if (!myInputSource.gamepad.axes[3])
                return;
            
            speed.z += myInputSource.gamepad.axes[3]
            
        })

        speed.applyQuaternion(this.renderer.xr.getCamera().quaternion)

        // MOVE OBSERVER
        // Get actual reference space
        const baseReferenceSpace = this.renderer.xr.getReferenceSpace()
        // Change reference space
        // const myTransform = new XRRigidTransform(this.velocity.clone().negate())
        const myTransform = new XRRigidTransform(speed.negate()) 
        const newReferenceSpace = baseReferenceSpace.getOffsetReferenceSpace(myTransform)
        this.renderer.xr.setReferenceSpace(newReferenceSpace)

        return

        // 
    }

}

