const DMX = require('dmx')

const dmx = new DMX();
const universe = dmx.addUniverse(
	"media",
	"enttec-usb-dmx-pro",
	"/dev/cu.usbserial-EN263468"
)
const universe2 = dmx.addUniverse(
	"media",
	"enttec-usb-dmx-pro",
	"/dev/cu.usbserial-EN275332"
)

var PORT = 33333;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

let lights_prev = {}
let lights2_prev = {}

for(let i = 0; i < 144 * 3; i++){
	lights_prev[i.toString()] = 0
	lights2_prev[i.toString()] = 0
}

server.on('listening', function () {
	var address = server.address();
	console.log('UDP Server listening on ' + address.address + ':' + address.port);
});

counter = 0

server.on('message', function (message, remote) {
	const values = message.toString()
	const valList = values.split(",")
	let valListTrimemed = valList.slice(1) 
	counter += 0.005
	let lights = {}
	let lights2 = {}

	let rightCounter = 0
	let leftCounter = 0

	const flames = {r: 1, g: 0.3, b: 0}

	const redGain = flames.r
	const greenGain = flames.g
	const blueGain = flames.b

	for(let i = 0; i < 12; i++){
		for(let j = 0; j < 24; j++){
			let idx = i * 24 + j
			if(j < 12){ // Right

				let val = Math.round(valListTrimemed[idx])

				lights[3 * rightCounter + 1] = Math.max(val * redGain,0)
				lights[3 * rightCounter + 2] = Math.max(val * greenGain,0)
				lights[3 * rightCounter + 3] = Math.max(val * blueGain,0)

				rightCounter++

			}else{ // Left

                let val = Math.round(valListTrimemed[idx])
                
				lights2[3 * leftCounter + 1] = Math.max(val * redGain,0)
				lights2[3 * leftCounter + 2] = Math.max(val * greenGain,0)
				lights2[3 * leftCounter + 3] = Math.max(val * blueGain,0)

				leftCounter++
			}
		}
	}

	for(let i = 0; i < 144 * 3; i++){
		lights[i.toString()] = Math.max(lights[i.toString()], lights_prev[i.toString()])
		lights2[i.toString()] = Math.max(lights2[i.toString()], lights2_prev[i.toString()])
    }
    
	//Send to DMX:
	universe.update(lights)
	universe2.update(lights2)

	for(let i = 0; i < 144 * 3; i++){
		lights_prev[i.toString()] = lights[i.toString()] - 0.2
		lights2_prev[i.toString()] = lights2[i.toString()] - 0.2
	}
	

});

server.bind(PORT, HOST);