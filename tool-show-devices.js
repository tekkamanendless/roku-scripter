'use strict';

const nodecast = require('nodecast');

let devices = nodecast.find();
devices.on('device', device => {
	console.log("Found device:", device.name);
	console.log("device:", device);
});

