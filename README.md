# Roku Scripter
Script against your Roku.

I developed this so that I could run a script to switch the dogs' TV to HGTV on Hulu.
They already have an account, so I wanted something that would go home, launch Hulu, pick the correct account, and jump to live TV.

## Usage

```
node main.js [<option>[ ...]] <file>[ ...]
```

Options:

* `--device-name`, the name of the device.

Example:

```
node main.js --device-name "My Roku" examples/hulu.json
```

## Command Files
Command files are JSON files with lists of actions to perform:

```
{
	"comment": "<some text to display>",
	"actions": [
		{
			"comment": "<some text to display>",
			"action": "press",
			"buttons": ["<button>", ...]
		},
		{
			"comment": "<some text to display>",
			"action": "sleep",
			"duration": <time in milliseconds>
		},
		{
			"comment": "<some text to display>",
			"action": "app",
			"name": "<name of the app>"
		},
		[...]
	]
}
```

## References:
1. Nodecast (DIAL): https://github.com/contra/nodecast
1. Roku: https://github.com/TheThingSystem/node-roku

