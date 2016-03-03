var main = new function main() {
	var self = this;
    var cache = {};
    var mesh = {};
    var meter;
    
    //vars
    var step = 0;
    
    //Toggle
    var isRendering = true;
    
    //Controls
    var controls = {};
    
    /************************************/
    /* DEFAULT                          */
    /************************************/
    
    this.init = function () {
	    meter = new FPSMeter({ theme: 'transparent', graph: 1, heat: 1 });
	    
        initCache();
        initThree();
        registerEvents();
        
        //Render
		render();
                        
        return self;
    };
    
    var initCache = function () {
	    cache.winW = window.innerWidth;
	    cache.winH = window.innerHeight;
	    
	    cache.body = $('body');
	    cache.webgl = $('#WebGL-output');
    };    
    
    var registerEvents = function() {
	    $(window).resize(layout);
    };
    
    var layout = function() {
	    cache.winW = window.innerWidth;
	    cache.winH = window.innerHeight;
    };
    
    var render = function() {	    
	    if(isRendering) {
		    meter.tickStart();

			self.geom.verticesNeedUpdate = true;
            self.geom.computeFaceNormals();

		    
		    self.renderer.render(self.scene, self.camera);
		    		    
			requestAnimationFrame(render);
			
			meter.tick();
	    }
    };
    
    /************************************/
    /* Experiment                       */
    /************************************/
    
    var initThree = function () {
	    //Global Webgl object
		self.scene = new THREE.Scene();
		
		self.camera = new THREE.PerspectiveCamera(45, cache.winW / cache.winH, 0.1, 1000);
		
		self.renderer = new THREE.WebGLRenderer();
		self.renderer.setClearColor(0xEEEEEE, 1.0);
		self.renderer.setSize(cache.winW, cache.winH);
		self.renderer.shadowMap.enabled = true;
				
		//Guides
		var axes = new THREE.AxisHelper( 20 );
		self.scene.add(axes);
		
		//Mesh
		self.planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1);
		var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
		mesh.plane = new THREE.Mesh(self.planeGeometry,planeMaterial);
		mesh.plane.name = "Plane";
		mesh.plane.receiveShadow = true;
		mesh.plane.rotation.x = -0.5*Math.PI;
		mesh.plane.position.x = 0;
		mesh.plane.position.y = 0;
		mesh.plane.position.z = 0;
		self.scene.add(mesh.plane);
		
		self.scene.add(customMesh());
		
		//Position Camera
		self.camera.position.x = -30;
		self.camera.position.y = 40;
		self.camera.position.z = 30;
		self.camera.lookAt(self.scene.position);
		
		//Lights
        var ambientLight = new THREE.AmbientLight(0x0c0c0c);
        self.scene.add(ambientLight);

        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(-40, 60, -10);
        spotLight.castShadow = true;
        self.scene.add(spotLight);

		
		//Print the output
		cache.webgl.html(self.renderer.domElement);
    };
    
    var customMesh = function () {
	    var vertices = [
            new THREE.Vector3(1, 3, 1),
            new THREE.Vector3(1, 3, -1),
            new THREE.Vector3(1, -1, 1),
            new THREE.Vector3(1, -1, -1),
            new THREE.Vector3(-1, 3, -1),
            new THREE.Vector3(-1, 3, 1),
            new THREE.Vector3(-1, -1, -1),
            new THREE.Vector3(-1, -1, 1)
        ];
        
        //Add control for each vertices
        controls.vertices = [];
        vertices.forEach(function(element, index) {
	         controls.vertices.push({x : element['x'], y : element['y'], z : element['z']});
        });

        var faces = [
            new THREE.Face3(0, 2, 1),
            new THREE.Face3(2, 3, 1),
            new THREE.Face3(4, 6, 5),
            new THREE.Face3(6, 7, 5),
            new THREE.Face3(4, 5, 1),
            new THREE.Face3(5, 0, 1),
            new THREE.Face3(7, 6, 2),
            new THREE.Face3(6, 3, 2),
            new THREE.Face3(5, 7, 0),
            new THREE.Face3(7, 2, 0),
            new THREE.Face3(1, 3, 4),
            new THREE.Face3(3, 6, 4),
        ];
        
        self.geom = new THREE.Geometry();
		self.geom.vertices = vertices;
		self.geom.faces = faces;
		self.geom.computeFaceNormals();
		
		var materials = [
            new THREE.MeshLambertMaterial({opacity: 0.6, color: 0x44ff44, transparent: true}),
            new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true})
        ];
        
        mesh.custom = THREE.SceneUtils.createMultiMaterialObject(self.geom, materials);
        mesh.custom.name = "Custom";
        
        mesh.custom.position.x = 0;
		mesh.custom.position.y = 2;
		mesh.custom.position.z = 0;
                
        mesh.custom.children.forEach(function (e) {
	        e.name = "Custom";
            e.castShadow = true;
        });
		
        initControls();
        
        return mesh.custom;
    };
    
    var initControls = function () {	    
	    self.gui = new dat.GUI();
	    
	    for (var i = 0; i < controls.vertices.length; i++) {
            var f = self.gui.addFolder('Vertices ' + (i + 1));
            f.add(self.geom.vertices[i], 'x', -10, 10);
            f.add(self.geom.vertices[i], 'y', -10, 10);
            f.add(self.geom.vertices[i], 'z', -10, 10);
        }
    };
};