## Prerequisites

* NodeJS v4 +
* npm v3 +

## How to use

* Get required dependencies by running
```
npm install
```

* Build PATH data for your GTA III installation

 ```
 node build.js -p "GTA-3-directory" > gta3.json
 ```

where `GTA-3-directory` is the full path to your GTA III directory, i.e.

 ```
 node build.js -p "D:\\Games\\GTA III" > gta3.json
 ```
* Open `index.html` in your browser.



