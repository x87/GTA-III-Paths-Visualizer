## Prerequisites

* NodeJS v4 +
* npm v3 +

## Usage

Clone the repository
```
git clone https://github.com/x87/GTA-III-Paths-Visualizer.git
cd GTA-III-Paths-Visualizer
```

Get the required dependencies by running
```
npm install
```

Build the PATH data out of your GTA III files

```
node build.js -p "/path/to/GTA III" > gta3.json
```

where `/path/to/GTA III` is the full path to your GTA III directory.

```
node build.js -p "D:\\Games\\GTA III" > gta3.json
```
Run
```
npm start
```
Open `http://localhost:4444` in your browser. You should see a map image with paths rendered on it.