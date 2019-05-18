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

class RwV3D {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}

module.exports = class PathParser {

	constructor(gameDir, game) {
		this.gameDir = gameDir;
		this.game = game;
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
					for (let j = i + 1; j < lines.length; j++ , i++) {
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
				const fileName = path.join(baseDir, folder, folder + '.ipl');
				this.loadInstFromFile(fileName, result);
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
				this.loadPathFromFile(fileName, result);
			});
			return result;
		} catch (err) {
			return [];
		}
	}

	loadInstFromFile(fileName, dest) {
		const data = this.parseFile(fileName, 'inst');
		data.forEach(entry => {
			dest.push(this.getInst(entry))
		});
	}


	loadPathFromFile(fileName, dest) {
		const path = this.parseFile(fileName, 'path');
		let id;
		let ped;

		path.forEach((entry, index) => {
			if (index % 13 === 0) {
				id = entry[1];
				ped = this.isPedPath(entry[0]);
			} else {

				if (entry[0] !== '0') {
					dest[id] = dest[id] || {};
					dest[id][ped ? 'ped' : 'car'] = dest[id][ped ? 'ped' : 'car'] || [];
					dest[id][ped ? 'ped' : 'car'].push(entry);
				}

			}
		});
	}

	readVCDat() {
		const name = path.join(this.gameDir, 'data', 'gta_vc.dat');
		let datFile;
		try {
			datFile = fs.readFileSync(name, 'utf8');
		} catch (e) {
			console.error(e.message || e);
		}
		const lines = datFile.split('\n');

		const paths = {};

		lines.forEach(line => {
			const data = this.splitString(line, ' ');
			if (data.length < 2) {
				return;
			}

			const fileName = path.join(this.gameDir, data[1]);
			switch (data[0]) {
				case 'IPL':
				case 'IDE':
					const path = this.parseFile(fileName, 'path');
					let id = 0;
					let ped;

					path.forEach((entry, index) => {
						if (index % 13 === 0) {
							id++
							ped = this.isPedPath(entry[0]);
						} else {

							if (entry[0] !== '0') {
								paths[id] = paths[id] || {};
								paths[id][ped ? 'ped' : 'car'] = paths[id][ped ? 'ped' : 'car'] || [];
								paths[id][ped ? 'ped' : 'car'].push(entry);
							}

						}
					});
			}

		});
		return this.fromVCPath(paths);
	}

	readGta3Dat() {

		const name = path.join(this.gameDir, 'data', 'gta3.dat');
		let datFile;
		try {
			datFile = fs.readFileSync(name, 'utf8');
		} catch (e) {
			console.error(e.message || e);
		}
		const lines = datFile.split('\n');

		const insts = [];
		const paths = {};

		lines.forEach(line => {
			const data = this.splitString(line, ' ');
			if (data.length < 2) {
				return;
			}

			const fileName = path.join(this.gameDir, data[1]);
			switch (data[0]) {
				case 'IPL':
				case 'IDE':
					this.loadInstFromFile(fileName, insts);
					this.loadPathFromFile(fileName, paths);
			}

		});
		return this.mergeInstAndPath(insts, paths);
	}

	getInst(entry) {
		const len = entry.length;
		// read entries from end to support different formats of GTA3 and VC
		return {
			id: entry[0],
			pos: new RwV3D(entry[len - 10], entry[len - 9], entry[len - 8]),
			rot: new Quaternion(entry[len - 4], entry[len - 3], entry[len - 2], entry[len - 1])
		}
	}

	isPedPath(id) {
		if (this.game === 'gta3' && id === 'ped') {
			return true;
		}
		if (this.game === 'vc' && id === '0') {
			return true;
		}
		return false;
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

	fromVCPath(path) {

		const result = [];
		for (let index in path) {
			if (path.hasOwnProperty(index)) {
				result.push({
					pos: new RwV3D(0, 0, 0),
					rot: new Quaternion(0, 0, 0, 1),
					node: path[index]
				})
			}
		}
		return result;
	}

};
