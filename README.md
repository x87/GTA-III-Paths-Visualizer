
`GTA III Paths Visualizer` is a P5.js-based 2D renderer that allows to visualize paths data for [GTA III](https://gtamods.com/wiki/PATH_(IDE_Section))  and [GTA Vice City](https://gtamods.com/wiki/Paths_(Vice_City)) games. Examples of rendering could be found in the `/render` directory.

## Prerequisites

* NodeJS v4 +
* npm v3 +

## Usage

* Clone the repository

```bash
git clone https://github.com/x87/GTA-III-Paths-Visualizer.git
cd GTA-III-Paths-Visualizer
```

* Get the required dependencies by running

```bash
npm install
```

* Parse PATH data out of GTA III and/or Vice City files
```bash
node parse -p "/path/to/GTA III" -g gta3 > gta3.json
node parse -p "/path/to/GTA Vice City" -g vc > gtavc.json
```
#### Example:
```bash
node parse -p "D:\\Games\\GTA III" -g gta3 > gta3.json
```
### Rendering Paths

* Run
  ```bash
  npm start
  ```
 * Navigate to `http://localhost:4444`
	 * You may navigate directly to the specific game renderer by providing the `game` parameter in the url, e.g.:
	 `http://localhost:4444?game=gta3` or `http://localhost:4444?game=vc`
* In the opened page select a desired game and kind of paths to render
	* paths can be customized by providing the `type` parameter in the url, e.g.:
		* `type=car,ped` - render both cars and peds paths
		* `type=car` - render only cars paths
		* `type=ped` - render only peds paths
* To save the rendered image click the **Save to file** button at top left corner.

Recommended browser: **Google Chrome**

### Licence
MIT License.