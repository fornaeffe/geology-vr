/**
 * original code by:
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

import * as THREE from 'three';

export class DeviceOrientationControls {

    camera: THREE.Camera

    enabled = true
    movementDetected = false

    onMovementDetected = () => {}
    
    constructor(camera: THREE.Camera) {
        this.camera = camera
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

        if ( !this.movementDetected ) {
            this.movementDetected = true
            this.onMovementDetected()
        }

        if ( !this.enabled ) return;

        const alpha = THREE.MathUtils.degToRad( event.alpha ) // Z
		const beta = THREE.MathUtils.degToRad( event.beta ) // X'
		const gamma = THREE.MathUtils.degToRad( event.gamma ) // Y''
		
		this.setObjectQuaternion( this.camera.quaternion, alpha, beta, gamma )
		
	}

    // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''
	setObjectQuaternion( quaternion: THREE.Quaternion, alpha: number, beta: number, gamma: number ) {
		const euler = new THREE.Euler();
		const q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis
        const q0 = new THREE.Quaternion();
        const zee = new THREE.Vector3( 0, 0, 1 );
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



