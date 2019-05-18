const PathParser = require('./reader');
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
	{ name: 'path', alias: 'p', type: String },
	{ name: 'game', alias: 'g', type: String }
];
let reader;
let data;
const options = commandLineArgs(optionDefinitions);
switch (options.game) {
	case 'gta3':
		reader = new PathParser(options.path, 'gta3');
		data = reader.readGta3Dat();
		break;
	case 'gtavc':
	case 'vc':
		reader = new PathParser(options.path, 'vc');
		data = reader.readVCDat();
		break;
}
console.log(JSON.stringify({ data }));
