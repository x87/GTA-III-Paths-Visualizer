'use strict';

const fs = require('fs');
const path = require('path');

class Quaternion {
	constructor(x, y, z, w) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}
}

class RwV3D{
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}


module.exports = class PathReader {

	constructor(gameDir) {
		this.gameDir = gameDir;
	}

	splitString(line, separator) {
		const strings = line.split(separator || ',');
		return strings.map(s => s.trim());
	}

	parseFile(name, section) {

		try {
			const data = fs.readFileSync(name, 'utf8');
			const lines = data.split('\n');
			const result = [];
			for (let i = 0; i < lines.length; i++) {
				let line;
				line = lines[i].trim();
				if (line === section) {
					for (let j = i + 1; j < lines.length; j++, i++) {
						line = lines[j].trim();
						if (line === 'end') {
							break;
						}
						result.push(this.splitString(line));
					}
				}
			}
			return result;

		} catch (err) {
			return [];
		}

	}

	loadAllInst() {
		try {
			const baseDir = path.join(this.gameDir, 'data', 'maps');
	 		const folders = fs.readdirSync(baseDir);
			const result = [];
			folders.forEach(folder => {
				const stat = fs.statSync(path.join(baseDir, folder));

				if (!stat.isDirectory()) {
					return;
				}

				// todo: loadInstFromFile()
				const fileName = path.join(baseDir, folder, folder + '.ipl');
				const data = this.parseFile(fileName, 'inst');

				data.forEach(entry => {
					result.push({
						id: entry[0],
						pos: new RwV3D(entry[2], entry[3], entry[4]),
						rot: new Quaternion(entry[8], entry[9], entry[10], entry[11])
					});
				});
			});
			return result;
		} catch (err) {
			return [];
		}
	}

	loadAllPath() {
		try {
			const baseDir = path.join(this.gameDir, 'data', 'maps');
			const folders = fs.readdirSync(baseDir);
			const result = {};
			folders.forEach(folder => {
				const stat = fs.statSync(path.join(baseDir, folder));

				if (!stat.isDirectory()) {
					return;
				}
				const fileName = path.join(baseDir, folder, folder + '.ide');
				const data = this.parseFile(fileName, 'path');

				// todo: loadPathFromFile()
				let id;
				let ped;
				data.forEach((entry, index) => {
					if (index % 13 === 0) {
						id = entry[1];
						ped = entry[0] === 'ped';
					} else if (entry[0] !== '0') {
						result[id] = result[id] || {};
						result[id][ped ? 'ped' : 'car'] = result[id][ped ? 'ped' : 'car'] || [];
						result[id][ped ? 'ped' : 'car'].push(entry);
					}
				});
			});
			return result;

		} catch (err) {
			return [];
		}
	}

	loadInstFromFile(fileName) {
		const data = this.parseFile(fileName, 'inst');
		return data.map(entry => ({
			id: entry[0],
			pos: new RwV3D(entry[2], entry[3], entry[4]),
			rot: new Quaternion(entry[8], entry[9], entry[10], entry[11])
		}));
	}


	loadPathFromFile(fileName) {
		const data = this.parseFile(fileName, 'path');
		let id;
		let ped;
		const result = {};

		data.forEach((entry, index) => {
			if (index % 13 === 0) {
				id = entry[1];
				ped = entry[0] === 'ped';
			} else if (entry[0] !== '0') {
				result[id] = result[id] || {};
				result[id][ped ? 'ped' : 'car'] = result[id][ped ? 'ped' : 'car'] || [];
				result[id][ped ? 'ped' : 'car'].push(entry);
			}
		});
		return result;
	}


	readGta3Dat() {

		const name = path.join(this.gameDir,  'data', 'gta3.dat');
		const gta3dat = fs.readFileSync(name, 'utf8');
		const lines = gta3dat.split('\n');

		const insts = [];
		const paths = {};

		lines.forEach(line => {
			const data = this.splitString(line, ' ');
			if (data.length < 2) {
				return;
			}

			const fileName = path.join(this.gameDir, data[1]);
			switch(data[0]) {
				case 'IDE':
				{
					const path = this.parseFile(fileName, 'path');
					let id;
					let ped;

					path.forEach((entry, index) => {
						if (index % 13 === 0) {
							id = entry[1];
							ped = entry[0] === 'ped';
						} else {

							if (entry[0] !== '0') {
								paths[id] = paths[id] || {};
								paths[id][ped ? 'ped' : 'car'] = paths[id][ped ? 'ped' : 'car'] || [];
								paths[id][ped ? 'ped' : 'car'].push(entry);
							}

						}
					});
				}
					break;
				case 'IPL':
				{
					const data = this.parseFile(fileName, 'inst');
					data.forEach(entry => {
						insts.push({
							id: entry[0],
							pos: new RwV3D(entry[2], entry[3], entry[4]),
							rot: new Quaternion(entry[8], entry[9], entry[10], entry[11])
						})
					});

				}
					break;
			}

		});
		return this.mergeAllInstAndPath(insts, paths);
	}

	mergeAllInstAndPath(insts, paths) {
 		return this.mergeInstAndPath(insts, paths);
	}

	mergeInstAndPath(inst, path) {
		const result = [];

		inst.forEach(obj => {

			if (path[obj.id]) {
				result.push({
					pos: obj.pos,
					rot: obj.rot,
					node: path[obj.id]
				});
			}
		});

		return result;
	}

};
