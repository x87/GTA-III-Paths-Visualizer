const PathReader = require('./reader');
const path = require('path');

const commandLineArgs = require('command-line-args');

const optionDefinitions = [
	{ name: 'path', alias: 'p', type: String }
];

const options = commandLineArgs(optionDefinitions);
const reader = new PathReader(options.path);

console.log(JSON.stringify(reader.readGta3Dat()));
