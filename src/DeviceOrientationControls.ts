/**
 * Code partially copied from:
 * richt / http://richt.me
 * WestLangley / http://github.com/WestLangley
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

// TODO: get absolute orientation

import * as THREE from 'three';

export class DeviceOrientationControls {

    // Camera that will be controlled
    camera: THREE.Camera

    // TODO: should those be private?
    enabled = true // true if controls are on
    movementDetected = false // true if the device has given position data

    // A custom function that can be passed, and executed when the device first transmit data
    onMovementDetected = () => {}
    
    constructor(camera: THREE.Camera) {
        this.camera = camera

        // Starts event listener
        this.connect()
    }

    connect() {
        window.addEventListener( 'deviceorientation', (e) => this.onDeviceOrientationChangeEvent(e) );
        this.enabled = true;
    }

    disconnect() {
		window.removeEventListener( 'deviceorientation', (e) => this.onDeviceOrientationChangeEvent(e) );
		this.enabled = false;
	}

    onDeviceOrientationChangeEvent( event: DeviceOrientationEvent ) {

        // Check if the values are null
        if (event.alpha == null || event.beta == null || event.gamma == null)
            return;

        // If it is the first time we detect movements, call the (maybe) passed function
        if ( !this.movementDetected ) {
            this.movementDetected = true
            this.onMovementDetected()
        }

        if ( !this.enabled ) return;

        // Convert angles in radiants
        const alpha = THREE.MathUtils.degToRad( event.alpha ) // Z
		const beta = THREE.MathUtils.degToRad( event.beta ) // X'
		const gamma = THREE.MathUtils.degToRad( event.gamma ) // Y''
		
        // Rotate the camera
		this.setObjectQuaternion( this.camera.quaternion, alpha, beta, gamma )
		
	}

    // Honestly I don't know exactly what it does, but it works...
    // Original authors comment: The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''
	setObjectQuaternion( quaternion: THREE.Quaternion, alpha: number, beta: number, gamma: number ) {
		const euler = new THREE.Euler();
		const q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis
        const q0 = new THREE.Quaternion();
        const zee = new THREE.Vector3( 0, 0, 1 );

        // TODO: maybe it's better to store the orientation angle, and change it only when the change orientation event is fired?
        const orient = THREE.MathUtils.degToRad(window.screen.orientation.angle)

        euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us
        quaternion.setFromEuler( euler ); // orient the device
        quaternion.multiply( q1 ); // camera looks out the back of the device, not the top
        quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) )
	}

    dispose() {
        this.disconnect()
    }
}



