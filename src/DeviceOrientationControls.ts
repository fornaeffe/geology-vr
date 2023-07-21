import * as THREE from 'three';

export class DeviceOrientationControls {

    // Camera that will be controlled
    camera: THREE.Camera

    // TODO: should those be private?
    enabled = true // true if controls are on
    sensorDetected = false // true if the device has given position data

    sensor: AbsoluteOrientationSensor

    // A custom function that can be passed, and executed when the device first transmit data
    onSensorDetected = () => {}
    
    constructor(camera: THREE.Camera) {
        this.camera = camera

        // Starts event listener
        this.connect()
    }

    connect() {

        this.enabled = true;

        if (this.sensor) {
            this.sensor.start()
            return
        } 

        // TODO: move this in constructor
        // From https://developer.chrome.com/en/articles/generic-sensor/
        try {
            this.sensor = new AbsoluteOrientationSensor({ frequency: 10, referenceFrame: 'screen' });
            this.sensor.onerror = (event) => {
              // Handle runtime errors.
              if (event.error.name === 'NotAllowedError') {
                console.log('Permission to access sensor was denied.');
              } else if (event.error.name === 'NotReadableError') {
                console.log('Cannot connect to the sensor.');
              }
            };
            this.sensor.onreading = (e) => {
                if (!this.sensor.quaternion) {
                    console.log('Reading, but no quaternion.')
                    return
                }

                if (!this.sensorDetected) {
                  this.sensorDetected = true
                  this.onSensorDetected()
                }

                
                if (this.enabled) {
                  // Retrieve device absolute rotation quaternion
                  const q1 = new THREE.Quaternion().fromArray(this.sensor.quaternion)

                  // Apply rotation around x axis (camera points toward the back of the phone, not up)
                  // and then update camera quaternion
                  const q2 = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3(1, 0, 0), -Math.PI/2 )
                  this.camera.quaternion.multiplyQuaternions(q2, q1)
                }
                  
            };
            this.sensor.start();
          } catch (error) {
            // Handle construction errors.
            if (error.name === 'SecurityError') {
              console.log('Sensor construction was blocked by the Permissions Policy.');
            } else if (error.name === 'ReferenceError') {
              console.log('Sensor is not supported by the User Agent.');
            } else {
              throw error;
            }
          }

        
    }

    disconnect() {
		this.enabled = false

        if (!this.sensor)
            return;

		this.sensor.stop()
	}


}



