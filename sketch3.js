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

function print_text(s, x, y, size, font) {
    textSize(size);
    textFont(font);
    fill(255);
    stroke(255);
    text(s, px(x), py(y));
}

function prect(p, bFill, s, s_x, s_y) {
    polygon([p[0], p[1], p[0], p[3], p[2], p[3], p[2], p[1],], bFill, s, s_x, s_y);
}

function ppoint(x, y, color) {
    ellipseMode(RADIUS);
    stroke(0);
    ellipse(px(x), py(y), 2, 2);
    count++;
}

function polygon(p, bFill, s, s_x, s_y) {
    if (p.length === 4) {
        return polygon([p[0], p[1], p[0], p[3], p[2], p[3], p[2], p[1]], bFill, s, s_x, s_y);
    }
    beginShape();
    if (bFill) {
        fill(random(255), random(255), random(255), 90);
    } else {
        noFill();
    }

    for (var i = 0; i < p.length; i += 2) {
        vertex(px(parseFloat(p[i])), py(parseFloat(p[i + 1])));
    }
    endShape(CLOSE);
    print_text(s, s_x + 10, s_y + 40, 40, 150, "Segoe UI Light");
}

function drawMap(data) {

    data.map(function (el) {

        var x = parseFloat(el.pos.x);
        var y = parseFloat(el.pos.y);

        for (t in el.node) {
            if (el.node.hasOwnProperty(t)) {
                var ext = 0;
                var int = 0;
                el.node[t].map(function (n) {
                    if (t != 'car') return;
                    switch (t) {
                        case 'car' :
                            if (n[0] == 1) { // external

                                fill(255, 0, 0, 255);
                                ext++;

                            }
                            if (n[0] == 2) { // internal
                                fill(255, 255, 0, 255);
                                int++;
                            }
                            break;


                        case 'ped' :
                            if (n[0] == 1) { // external
                                fill(255, 0, 0, 255);

                            }
                            if (n[0] == 2) { // internal
                                fill(255, 255, 0, 255);

                            }
                            break;
                    }


                    var nodeX = x + n[3] / 16;
                    var nodeY = y + n[4] / 16;
                    var _link = n[1];
                    if (_link !== -1 && el.node[t].length > _link) {

                        var link = el.node[t][_link];
                        stroke(255);
                        if (link)
                            line(px(nodeX), py(nodeY), px(x + link[3] / 16), py(y + link[4] / 16));
                    }
                    ppoint(x + n[3] / 16, y + n[4] / 16);
                });
                // roadblocks
                if (ext == 2 && int == 1) {
                    fill(0, 255, 0, 255);
                    ppoint(x, y);
                    ext = 0;
                    int = 0;
                }
            }
        }
    });

}
function setup() {
    createCanvas(mapsize, mapsize);
    httpPost('/gta3paths/', {
        gameDir: "G:\\gta3",
        cache: 1
    }, 'json', function (response) {
        loadImage("gta3map.png", function (img) {
            image(img, 0, 0, mapsize, mapsize);
            drawMap(response);
        });
    })
}
