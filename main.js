'use strict';

const fs = require('fs');
const nodecast = require('nodecast');

let targetDeviceName = null;
let files = [];

for(let i = 2; i < process.argv.length; i++) { // Skip the first two arguments.
	let parameter = process.argv[i];
	if(parameter.startsWith("--")) {
		switch(parameter) {
			case "--device-name":
				i++;
				if(i >= process.argv.length) {
					console.error("Missing value.");
					process.exit(1);
				}
				targetDeviceName = process.argv[i];
				break;
			default:
				console.error("Unknown parameter:", parameter);
				process.exit(1);
		}
	} else {
		files.push(parameter);
	}
}

console.log("Target device name:", targetDeviceName);
console.log("Files:", files);

if(!targetDeviceName) {
	console.error("Missing device name.");
	process.exit(1);
}
if(files.length == 0) {
	console.error("Missing any command files.");
	process.exit(1);
}

/**
 * findDevice returns the device with the given name.
 *
 * @param name The exact name of the device to search for.
 * @param timeout An optional timeout, in milliseconds.
 *
 * @return The nodecast device.
 */
async function findDevice(name, timeout) {
	let deviceFound = false;
	return new Promise((resolve, reject) => {
		let devices = nodecast.find();
		devices.on('device', device => {
			//console.log("device:", device);
			console.log("Found device:", device.name);

			if(device.name === name) {
				deviceFound = true;
				devices.end();
				resolve(device);
			}
		});

		if(timeout > 0) {
			setTimeout(() => {
				if(!deviceFound) {
					reject(new Error("Could not find device after "+timeout+"ms."));
				}
			}, timeout);
		}
	});
}

/**
 * runScript runs the given script on the device.
 *
 * @param device The device returned by `findDevice`.
 * @param script The script to run.
 */
async function runScript(device, script) {
	if(script.comment) {
		console.log("~~~", script.comment, "~~~");
	}
	for(let a = 0; a < script.actions.length; a++) {
		let action = script.actions[a];
		if(action.comment) {
			console.log("~", action.comment, "~");
		}
		let promise = new Promise((resolve, reject) => {
			console.log("Action:", action.action);
			switch(action.action) {
				case "app":
					let app = device.app('Hulu');
					let data = null;
					app.start(data, err => {
						if(err) {
							console.warn("Error starting app:", err);
							reject(new Error("Error starting app: "+err));
						}
						resolve();
					});
					break;
				case "sleep":
					console.log("Duration:", action.duration);
					setTimeout(() => resolve(), action.duration);
					break;
				case "press":
					device.press(action.buttons, () => resolve());
					break;
				default:
					console.error("Unknown action:", action.action);
					reject(new Error("Unknown action: "+action.action));
			}
		});
		console.log("Waiting...");
		await promise;
		console.log("Waited.");
	}
}


async function main() {
	let device = await findDevice(targetDeviceName, 10*1000);
	console.log("Running on device:", device.name);

	for(let f = 0; f < files.length; f++) {
		let filename = files[f];
		console.log("Loading file:", filename);

		let contents = fs.readFileSync(filename);
		let payload = JSON.parse(contents);

		await runScript(device, payload);
	}
}

(async () => {
	console.log("Running main...");
	try {
		await main()
		console.log("All done.");
	} catch(err) {
		console.error("Encountered an error:", err);
		process.exit(1);
	}
})();

