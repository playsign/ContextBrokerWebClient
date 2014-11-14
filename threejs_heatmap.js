var cubegeom = new THREE.CubeGeometry(100, 100, 100);
var mat = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
var cube = new THREE.Mesh(cubegeom, mat);
scene.add(cube);

        // create a heatmap instance
        var heatmap = h337.create({
          container: document.getElementById('heatmapContainer'),
          maxOpacity: .5,
          radius: 10,
          blur: .75,
          // update the legend whenever there's an extrema change
          onExtremaChange: function onExtremaChange(data) {
            //updateLegend(data);
          }
        });

        // boundaries for data generation
        var width = (+window.getComputedStyle(document.body).width.replace(/px/,''));
        var height = (+window.getComputedStyle(document.body).height.replace(/px/,''));

        // generate 1000 datapoints
        var generate = function() {
          // randomly generate extremas
          var extremas = [(Math.random() * 1000) >> 0,(Math.random() * 1000) >> 0];
          var max = Math.max.apply(Math, extremas);
          var min = Math.min.apply(Math,extremas);
          var t = [];


          for (var i = 0; i < 1000; i++) {
            var x = (Math.random()* width) >> 0;
            var y = (Math.random()* height) >> 0;
            var c = ((Math.random()* max-min) >> 0) + min;
            // btw, we can set a radius on a point basis
            var r = (Math.random()* 80) >> 0;
            // add to dataset
            t.push({ x: x, y:y, value: c, radius: r });
          }
          var init = +new Date;
          // set the generated dataset
          heatmap.setData({
            min: min,
            max: max,
            data: t
          });
          console.log('took ', (+new Date) - init, 'ms');
        };
        // initial generate
        //generate();
updateData();

//sensor data reading -- instead of the random generation from example (above)
function updateData() {
    // COPY-PASTE from tapanij-vizi-poi Scene.js !!!
    ///Get offline Context Broker info
    var sceneScope = this;
    $.getJSON("nodeinfo.json", function(data) {
	heatmap_parseOfflineCBData(data);
    });
}

function normaliseGeopos(geopos) {
/* the area in Santander
bottom-left: 43.463369, -3.805923
top-right:   43.476170, -3.789915
*/
    var east = -3.805923;
    var west = -3.789915;
    var south = 43.463369;
    var north = 43.476170;

    var width = west - east;
    var height = north - south;
    
    var scale_x = 1 / width;
    var scale_y = 1 / height;
    
    var x = (west - geopos[1]) * scale_x;
    var y = (north - geopos[0]) * scale_y;

    return [x, y];
}

function heatmap_parseOfflineCBData(json) {
    console.log("hep");

    //read temperatures from own offline json
    var keys = Object.keys(json);
    var temperatures = []; //longlat, celciusfloat pairs
    for (k in keys) { //n for node, as in sensor (in nid, ndata etc)
        var nid = keys[k];
        var ninfo = json[nid];
        var ndata = ninfo.data; //there's also geopos
        if ("Temperature" in ndata) {
            var temperinfo = ndata["Temperature"]
            var tempernum = parseFloat(temperinfo); //temperinfo.slice(0, -2)
            temperatures.push([ninfo.geopos, tempernum]);
        }
    }
    //console.log(temperatures);

    //populate heatmap data
    var hmapdata = [];
    THREE.hmapdata = hmapdata;
    r = 10;
    temperatures.forEach(function(t) {
        //console.log(t);
        norm_xypos = normaliseGeopos(t[0]);
        var canvas = heatmap._renderer.canvas;
        var xypos = [-1, -1];
        xypos[0] = norm_xypos[0] * canvas.width;
        xypos[1] = norm_xypos[1] * canvas.height;
        //console.log(xypos);
        hmapdata.push({ x: xypos[0], y: xypos[1], value: t[1], radius: r });
    });

    heatmap.setData({
        min: 10,
        max: 30,
        data: hmapdata
    });
}

// whenever a user clicks on the ContainerWrapper the data will be regenerated -> new max & min
document.getElementById('heatmapContainerWrapper').onclick = function() { 
    //generate();
    updateData();
    cube.material.map.needsUpdate = true;            
};

var heatmap_tex = new THREE.Texture(heatmap._renderer.canvas, new THREE.UVMapping(), THREE.RepeatWrapping, THREE.RepeatWrapping);
mat.map = heatmap_tex;
cube.material.map.needsUpdate = true;
//heatmap._renderer.canvas.parentNode.removeChild(heatmap._renderer.canvas);
