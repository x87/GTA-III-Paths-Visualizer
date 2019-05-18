var mapsize = 1024 * 2;
var x_gamelimit = y_gamelimit = 2000;//gta3
//var x_gamelimit = y_gamelimit = 3000;//sa

var count = 0;
function px(x) {
    return (x + x_gamelimit) / (x_gamelimit * 2 / mapsize); //gta3
    // return (x + 2300) / (4000 / mapsize); //vc
    // return (x + 3000) / (6000 / mapsize); //sa

}
function py(y) {
    return (-y + y_gamelimit) / (y_gamelimit * 2 / mapsize); //gta3
    // return (-y + 2000) / (4000 / mapsize);//vc
    // return (-y + 3000) / (6000 / mapsize);//sa
}

function ppoint(x, y, color) {
    ellipseMode(RADIUS);
    stroke(0);
    ellipse(px(x), py(y), 2, 2);
    count++;
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

// http://gamedev.stackexchange.com/a/50545
function qrotate(x, y, z, rx, ry, rz, rw) {
    return [2.0 * dot([x, y, z], [rx, ry, rz]) * rx + (rw * rw - dot([rx, ry, rz], [rx, ry, rz])) * x + 2.0 * rw * cross([x, y, z], [rx, ry, rz])[0],
    2.0 * dot([x, y, z], [rx, ry, rz]) * ry + (rw * rw - dot([rx, ry, rz], [rx, ry, rz])) * y + 2.0 * rw * cross([x, y, z], [rx, ry, rz])[1],
    2.0 * dot([x, y, z], [rx, ry, rz]) * rz + (rw * rw - dot([rx, ry, rz], [rx, ry, rz])) * z + 2.0 * rw * cross([x, y, z], [rx, ry, rz])[2]];
}

function drawMap(data) {

    data.map(function (el) {

        var x = parseFloat(el.pos.x);
        var y = parseFloat(el.pos.y);
        var z = parseFloat(el.pos.z);
        var rx = parseFloat(el.rot.x);
        var ry = parseFloat(el.rot.y);
        var rz = parseFloat(el.rot.z);
        var rw = parseFloat(el.rot.w);

        for (var t in el.node) {
            if (el.node.hasOwnProperty(t)) {
                var ext = 0;
                var int = 0;
                el.node[t].map(function (n) {
                    switch (t) {
                        case 'car':
                            if (!pathType.includes('car')) return;

                            if (n[0] == 1) { // external

                                fill(255, 0, 0, 255);
                                ext++;

                            }
                            if (n[0] == 2) { // internal
                                fill(255, 255, 0, 255);
                                int++;
                            }
                            break;


                        case 'ped':

                            if (!pathType.includes('ped')) return;

                            if (n[0] == 1) { // external
                                fill(255, 0, 0, 255);

                            }
                            if (n[0] == 2) { // internal
                                fill(255, 255, 0, 255);

                            }
                            break;
                    }

                    var rotated = qrotate(n[3] / 16, n[4] / 16, 0, rx, ry, rz, rw);
                    var nodeX = x + rotated[0];
                    var nodeY = y + rotated[1];
                    var _link = n[1];
                    if (_link !== -1 && el.node[t].length > _link) {

                        var link = el.node[t][_link];
                        stroke(255, 0, 0);
                        if (link) {
                            var rotatedLink = qrotate(link[3] / 16, link[4] / 16, 0, rx, ry, rz, rw);
                            line(px(nodeX), py(nodeY), px(x + rotatedLink[0]), py(y + rotatedLink[1]));
                        }
                    }
                    ppoint(nodeX, nodeY);
                });
                // roadblocks
                /*if (ext == 2 && int == 1) {
                    fill(0, 255, 0, 255);
                    ppoint(x, y);
                    ext = 0;
                    int = 0;
                }*/
            }
        }
    });

}

function paramsToUrl(params) {
    var curParams = getURLParams();
    var newParams = Object.assign({}, curParams, params);
    return '?game=' + (newParams.game || 'gta3') + '&type=' + (newParams.type || '');
}

function getFileName() {
    if (game === 'gta3') {
        if (pathType.includes('ped') && !pathType.includes('car')) {
            return 'gta3_ped_paths.png';
        }
        if (pathType.includes('car') && !pathType.includes('ped')) {
            return 'gta3_car_paths.png';
        }
        return 'gta3_paths.png';
    }

    if (game === 'vc') {
        if (pathType.includes('ped') && !pathType.includes('car')) {
            return 'vc_ped_paths.png';
        }
        if (pathType.includes('car') && !pathType.includes('ped')) {
            return 'vc_car_paths.png';
        }
        return 'vc_paths.png';
    }

}

var data, img;
var pathType = [];
var game;

function preload() {
    var params = getURLParams() || { type: '' };
    pathType = (params.type || '').split(',');
    game = params.game;

    if (game === 'gta3') {
        data = loadJSON('./gta3.json', 'json', function () { }, function () {
            console.error('can not load gta3.json\nrun "node parse -p "/path/to/GTA III" -g gta3 > gta3.json" in terminal first');
        });
        img = loadImage('gta3map.png');
    } else if (game === 'vc') {
        data = loadJSON('./gtavc.json', 'json', function () { }, function () {
            console.error('can not load gtavc.json\nrun "node parse -p "/path/to/GTA Vice City" -g vc > gtavc.json" in terminal first');
        });
        img = loadImage('gtavcmap.png');
    } else {

        // try to identify a possible game choice
        data = loadJSON('./gta3.json', 'json', function () {
            window.location = paramsToUrl({ game: 'gta3' });
        }, function () {
            data = loadJSON('./gtavc.json', 'json', function () {
                window.location = paramsToUrl({ game: 'vc' });
            }, function () {
                window.location = '?game=gta3';
            });
        });

    }

}

function setup() {

    var button = createButton('Save to file');
    button.position(0, 0);
    button.size(150, 40);
    button.style('font-size', '24px');
    button.mousePressed(function () {
        save(getFileName());
    });

    var gameSelect = createSelect();
    gameSelect.size(170, 40);
    gameSelect.position(160, 0);
    gameSelect.option('GTA III', 'gta3');
    gameSelect.option('GTA Vice City', 'vc');
    gameSelect.style('font-size', '24px');

    gameSelect.value(game);
    gameSelect.changed(function (evt) {
        game = evt.target.value;
        if (game === 'gta3' || game === 'vc') {
            window.location = paramsToUrl({ game: game });
        }
    });

    var pedPaths = createCheckbox('Show ped paths', pathType.includes('ped'));
    pedPaths.changed(function (evt) {
        pathType = pathType.filter(function (t) {
            return t !== 'ped' && t
        });
        if (evt.target.checked) {
            pathType.push('ped');
        }

        window.location = paramsToUrl({ type: pathType });
    });
    pedPaths.position(340, 0);
    pedPaths.style('background', 'white').style('font-size', '24px');

    var carPaths = createCheckbox('Show car paths', pathType.includes('car'));
    carPaths.changed(function (evt) {
        pathType = pathType.filter(function (t) {
            return t !== 'car' && t
        });
        if (evt.target.checked) {
            pathType.push('car');
        }

        window.location = paramsToUrl({ type: pathType });
    });
    carPaths.position(340, 30);
    carPaths.style('background', 'white').style('font-size', '24px');

    createCanvas(mapsize, mapsize);
    image(img, 0, 0, mapsize, mapsize);
    console.log('Start drawing...');
    drawMap(data.data);
    console.log('Completed. Total ' + count + ' points drawn.');
}
