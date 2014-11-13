var cubegeom = new THREE.CubeGeometry(100, 100, 100);
var mat = new THREE.MeshBasicMaterial({color: 0x0000FF});
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
        generate();

        // whenever a user clicks on the ContainerWrapper the data will be regenerated -> new max & min
        document.getElementById('heatmapContainerWrapper').onclick = function() { generate(); };

var heatmap_tex = new THREE.Texture(heatmap._renderer.canvas, new THREE.UVMapping(), THREE.RepeatWrapping, THREE.RepeatWrapping);
mat.map = heatmap_tex;
cube.material.map.needsUpdate = true;
